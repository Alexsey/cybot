'use strict'

const moment = require('moment')
const _ = require('lodash') || false
const {
  keys, omit, filter, mapValues, sum, sumBy, groupBy, pick, map, invokeMap,
  round, transform, find, flatMap, remove, reject
} = _

/*
 now = past + trade + io
 trade = buy - sell - commission
 io = deposit - withdrawal - txCost
*/

module.exports = {
  getBalancesAt,

  getRates,

  getTradeMinMax,
  getBuySellOrders,
  getBuyAmount,
  getSellAmount,
  getCommission,

  getIO,
  getWithdrawal,
  getDeposit,
  getTxCost,
}

function getBalancesAt (data, at, currency) {
  return currency
    ? getBalanceOfTrader(data, at, currency)
    : transform(data.balances, (acc, {currency}) => {
      acc[currency] = getBalanceOfTrader(data, at, currency)
    }, {})
}

function getAllBalancesAt (data, at, currency) {
  return mapValues(data.balances, (_, traderName) => {
    const traderData = data[traderName]
    return currency
      ? getBalanceOfTrader(traderData, at, currency)
      : transform(traderData.balances, (acc, {currency}) => {
        acc[currency] = getBalanceOfTrader(traderData, at, currency)
      }, {})
  })
}

function getBalanceOfTrader (data, at, currency) {
  const {orderHistory, balances, depositHistory, withdrawalHistory} = data
  const {balance} = find(balances, {currency})
  const [trade] = getTradeMinMax(orderHistory, {currency, after: at})
  const io = getIO(depositHistory, withdrawalHistory, {currency, after: at})
  return balance - trade - io
}

function getRates (marketSummaries) {
  const rates = {USDT: 1}
  marketSummaries = marketSummaries.slice()
  let newRates = new Set(keys(rates))
  while (newRates.size) {
    const newPairs = flatMap([...newRates.values()], currency =>
      remove(marketSummaries, m => m.marketName.includes(currency))
    )
    newRates = new Set
    newPairs.forEach(({marketName: pair, last: price}) => {
      const [cur1, cur2] = pair.split('-')
      const newCur = rates[cur1] ? cur2 : cur1
      const oldCur = rates[cur1] ? cur1 : cur2
      newRates.add(newCur)
      rates[newCur] = pair.startsWith(oldCur)
        ? rates[oldCur] * price
        : rates[oldCur] / price
    })
    remove(marketSummaries, ({marketName}) => {
      const [cur1, cur2] = marketName.split('-')
      return rates[cur1] && rates[cur2]
    })
  }
  return rates
}

function getTrade (orders, {currency, rates, after}) {
  if (!currency && !rates) throw Error('Need currency or rates')
  if (after) orders = orders.filter(o => moment(o.timeStamp).isAfter(after))
  if (currency) {
    const commission = getCommission(orders, {currency})
    const [buyOrders, sellOrders] = getBuySellOrders(orders, currency)
    const buy = getBuyAmount(buyOrders, currency)
    const sell = getSellAmount(sellOrders, currency)
    return buy - sell - commission
  } else {
    const commission = getCommission(orders, {rates})
    const amount = _(orders).sumBy(({exchange, orderType, price, quantity}) => {
      const [curA, curB] = exchange.split('-')
      const amountA = price * rates[curA]
      const amountB = quantity * rates[curB]
      const isBuyOrder = orderType.match(/buy/i)
      return isBuyOrder ? amountB - amountA : amountA - amountB
    })
    return amount - commission
  }
}

function getBuySellOrders (orders, currency, after) {
  if (after) orders = orders.filter(o => moment(o.timeStamp).isAfter(after))
  return _(orders)
    .filter(o => o.exchange.includes(currency))
    .partition(v =>
      v.exchange.startsWith(currency) && v.orderType.endsWith('SELL')
      || v.exchange.endsWith(currency) && v.orderType.endsWith('BUY')
    )
    .value()
}

function getBuyAmount (orders, currency) {
  return sumBy(orders.filter(o => o.exchange.startsWith(currency)), 'price')
    + sumBy(orders.filter(o => o.exchange.endsWith(currency)), 'quantity')
    - sumBy(orders.filter(o => o.exchange.endsWith(currency)), 'quantityRemaining')
}

function getSellAmount (orders, currency) {
  return sumBy(orders.filter(o => o.exchange.startsWith(currency)), 'price')
    + sumBy(orders.filter(o => o.exchange.endsWith(currency)), 'quantity')
    - sumBy(orders.filter(o => o.exchange.endsWith(currency)), 'quantityRemaining')
}

function getCommission (orders, {currency, rates, after}) {
  if (!currency && !rates) throw Error('Need currency or rates')
  if (after) orders = orders.filter(o => moment(o.timeStamp).isAfter(after))
  return currency
    ? _(orders)
      .filter(({exchange}) => exchange.startsWith(currency))
      .sumBy('commission')
    : _(orders).sumBy(({exchange, commission}) => {
      const currency = exchange.match(/^\w+/)[0]
      return rates[currency] * commission
    })
}

function openOrdersInUSDT (orders, rates) {
  return _(orders)
    .reject('closed')
    .sumBy(({exchange, orderType, price, quantity}) => {
      const [[currency], amount] = orderType.match(/buy/i)
        ? [exchange.match(/^\w+/), price]
        : [exchange.match(/\w+$/), quantity]
      return rates[currency] * amount
    })
}

function getIO (deposits, withdrawals, {currency, rates, after}) {
  return getDeposit(deposits, {currency, rates, after})
    - getWithdrawal(withdrawals, {currency, rates, after})
    - getTxCost(deposits, withdrawals, {currency, rates, after})
}

function getTxCost (deposits, withdrawals, {currency, rates, after}) {
  if (!currency && !rates) throw Error('Need currency or rates')
  withdrawals = reject(withdrawals, 'pendingPayment')
  if (after) {
    deposits = deposits.filter(d => moment(d.lastUpdated).isAfter(after))
    withdrawals = withdrawals.filter(w => moment(w.opened).isAfter(after))
  }
  let payments = [...deposits, ...withdrawals]
  return currency
    ? _(payments).filter({currency}).sumBy('txCost') || 0
    : _(payments).sumBy(({currency, txCost}) =>
      rates[currency] * txCost || 0
    )
}

function getWithdrawal (withdrawals, {currency, rates, after}) {
  if (!currency && !rates) throw Error('Need currency or rates')
  withdrawals = reject(withdrawals, 'pendingPayment')
  if (after) withdrawals = withdrawals.filter(w => moment(w.opened).isAfter(after))
  return currency
    ? _(withdrawals).filter({currency}).sumBy('amount')
    : _(withdrawals).sumBy(({currency, amount}) =>
      rates[currency] * amount
    )
}

function getDeposit (deposits, {currency, rates, after}) {
  if (!currency && !rates) throw Error('Need currency or rates')
  if (after) deposits = deposits.filter(o => moment(o.lastUpdated).isAfter(after))
  return currency
    ? _(deposits).filter({currency}).sumBy('amount')
    : _(deposits).sumBy(({currency, amount}) =>
      rates[currency] * amount
    )
}

function getTradeMinMax (orders, {currency, rates, after}) {
  if (!currency && !rates) throw Error('Need currency or rates')
  if (after) orders = orders.filter(o => moment(o.timeStamp).isAfter(after))
  let [cur, min, max] = [0, 0, 0]
  currency
    ? orders.forEach(({exchange, orderType, price, quantity, commission}) => {
      const [curA, curB] = exchange.split('-')
      if (![curA, curB].includes(currency)) return
      orderType.match(/buy/i)
        ? curA == currency
          ? cur = cur - price - commission
          : cur += quantity
        : curA == currency
          ? cur = cur + price - commission
          : cur -= quantity
      min = Math.min(min, cur)
      max = Math.max(max, cur)
    })
    : orders.forEach(({exchange, orderType, price, quantity, commission}) => {
      const [curA, curB] = exchange.split('-')
      const amountA = price * rates[curA]
      const amountB = quantity * rates[curB]
      const isBuyOrder = orderType.match(/buy/i)
      const commissionUSDT = commission * rates[curA]
      cur += (isBuyOrder ? amountB - amountA : amountA - amountB) - commissionUSDT
      min = Math.min(min, cur)
      max = Math.max(max, cur)
    })
  return [cur, min, max]
}