'use strict'

const moment = require('moment')
const _ = require('lodash') || false
const {
  keys, omit, filter, mapValues, sum, sumBy, groupBy, pick, map, invokeMap,
  round, transform
} = _
const {all: bittrex} = require('./bittrexApi')

module.exports = {
  getBalancesAt,
  calcTotals,
  getBuySellOrders,
  getBuyAmount,
  getSellAmount,
  getCommission,
  getWithdrawal,
  getDeposit
}

function getBalancesAt (data, at, currency) {
  return currency
    ? forTraderForCurrency(data, at, currency)
    : mapValues(data.balances, ({currency}) => {
      forTraderForCurrency(data, at, currency)
    })
}

function getAllBalancesAt (data, at, currency) {
  return mapValues(data.balances, (_, traderName) => {
    const traderData = data[traderName]
    return currency
      ? forTraderForCurrency(traderData, at, currency)
      : mapValues(traderData.balances, ({currency}) => {
        forTraderForCurrency(traderData, at, currency)
      })
  })
}

function forTraderForCurrency (data, at, currency) {
  const {orderHistory, balances} = data
  const {balance} = balances[currency]
  const [buyOrders, sellOrders] = getBuySellOrders(orderHistory, currency, at)
  const buy = getBuyAmount(buyOrders, currency)
  const sell = getSellAmount(sellOrders, currency)
  const commission = getCommission(orderHistory, currency)
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

function getBuySellOrders (orders, currency, after = new Date(0)) {
  return _(orders)
    .filter(o => moment(o.closed).isAfter(after))
    .filter(o => o.exchange.includes(currency))
    .partition(v =>
      v.exchange.startsWith(currency) && v.orderType.endsWith('SELL')
      || v.exchange.endsWith(currency) && v.orderType.endsWith('BUY')
    ).value()
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

function getCommission (orders, currency) {
  return sumBy(orders.filter(o => o.exchange.startsWith(currency)), 'commission')
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