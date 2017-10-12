'use strict'

/*
 now = past + trade + io
 trade = buy - sell - commission
 io = deposit - withdrawal - txCost
*/

// const _ = require('lodash')
// const moment = require('moment-timezone')

const {
  keys, mapValues, sumBy, transform, find, flatMap, remove, reject
} = _

const bittrexHelpers = (() => {
// module.exports = (() => {
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
    const trade = getTrade(orderHistory, {currency, after: at})
    const io = getIO(depositHistory, withdrawalHistory, {currency, after: at})
    // because of float operations it would no always become 0 while it should be
    const res = balance - trade - io
    return Math.abs(res) < 1e-8 ? 0 : res
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
      const res = buy - sell - commission
      return Math.abs(res) < 1e-8 ? 0 : res
    } else {
      const commission = getCommission(orders, {rates})
      const amount = _(orders).sumBy(({exchange, orderType, price, quantity, quantityRemaining}) => {
        const [curA, curB] = exchange.split('-')
        const amountA = price * rates[curA]
        const amountB = (quantity - quantityRemaining) * rates[curB]
        const isBuyOrder = orderType.match(/buy/i)
        return isBuyOrder ? amountB - amountA : amountA - amountB
      })
      const res = amount - commission
      return Math.abs(res) < 1e-8 ? 0 : res
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
      .sumBy(({exchange, orderType, price, quantity, quantityRemaining}) => {
        const [[currency], amount] = orderType.match(/buy/i)
          ? [exchange.match(/^\w+/), price]
          : [exchange.match(/\w+$/), quantity - quantityRemaining]
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

  return {
    getBalancesAt,

    getRates,

    getTrade,
    getBuySellOrders,
    getBuyAmount,
    getSellAmount,
    getCommission,

    getIO,
    getWithdrawal,
    getDeposit,
    getTxCost,
  }
})()