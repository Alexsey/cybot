'use strict'

const moment = require('moment')
const _ = require('lodash') || false
const {
  keys, omit, filter, mapValues, sum, sumBy, groupBy, pick, map, invokeMap,
  round, transform, find, flatMap, remove
} = _

module.exports = {
  getBalancesAt,
  calcTotals,
  getBuySellOrders,
  getRates,
  getBuyAmount,
  getSellAmount,
  getCommission,
  getWithdrawal,
  getDeposit
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
  const {orderHistory, balances} = data
  const {balance} = find(balances, {currency})
  const [buyOrders, sellOrders] = getBuySellOrders(orderHistory, currency, at)
  const buy = getBuyAmount(buyOrders, currency)
  const sell = getSellAmount(sellOrders, currency)
  const commission = getCommission(orderHistory, currency, at)
  return balance - buy + sell + commission
}

function calcTotals (data) {
  const {depositHistory, withdrawalHistory, orderHistory} = data
  return transform(data.balances, (acc, {currency, balance}) => {
    const deposit = getDeposit(depositHistory, currency)
    const withdrawal = getWithdrawal(withdrawalHistory, currency)
    const commission = getCommission(orderHistory, currency)
    const txCost = getTxCost(depositHistory, withdrawalHistory, currency)
    const [buyOrders, sellOrders] = getBuySellOrders(orderHistory, currency)
    const buy = getBuyAmount(buyOrders, currency)
    const sell = getSellAmount(sellOrders, currency)
    acc[currency] = {
      currency,
      deposit,
      buy,
      balance,
      withdrawal,
      txCost,
      sell,
      commission,
      total: round(deposit + buy - balance - withdrawal - txCost - sell - commission, 5),
    }
  }, {})
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

function getBuySellOrders (orders, currency, after = new Date(0)) {
  return _(orders)
    .filter(o => moment(o.timeStamp).isAfter(after))
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

function getCommission (orders, currency, after = new Date(0)) {
  return sumBy(orders
    .filter(o => moment(o.timeStamp).isAfter(after))
    .filter(o => o.exchange.startsWith(currency)
    ), 'commission')
}

function getTxCost (depositHistory, withdrawalHistory, currency) {
  return sum([
    sumBy(filter(depositHistory, {currency}), 'txCost'),
    sumBy(filter(withdrawalHistory, {currency}), 'txCost')
  ])
}

function getWithdrawal (withdrawals, currency) {
  return _(withdrawals).filter({currency}).sumBy('amount')
}

function getDeposit (deposits, currency) {
  return _(deposits).filter({currency}).sumBy('amount')
}