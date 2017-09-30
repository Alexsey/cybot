'use strict'

require('util').inspect.defaultOptions.colors = true
require('util').inspect.styles.number = 'cyan'
const _ = require('lodash') || false
const moment = require('moment')
const {
  keys, omit, filter, mapValues, sum, sumBy, groupBy, pick, map, invokeMap,
  round, reject
} = _
const {all: bittrex, first} = require('./bittrexApi')
const {getBalancesAt, calcTotals, getBuySellOrders} = require('./bittrexHelpers')

;(async () => {
  const orderHistory = await first.getOrderHistory()
  const depositHistory = await first.getDepositHistory()
  const withdrawalHistory = await first.getWithdrawalHistory()
  const balances = await first.getBalances()

  const firstData = {orderHistory, depositHistory, withdrawalHistory, balances}
  console.log(calcTotals(firstData))

  // const orders = orderHistory.filter(o => o.exchange.includes('XRP'))
  // const [buyOrders, sellOrders] = getBuySellOrders(orders, 'XRP')
  // console.log(buyOrders)
  // console.log('\n\n\n')
  // console.log(sellOrders)
})()

async function getOrderHistory (of) {
  let result = await bittrex.getOrderHistory()
  if (!of) return result
  of = of.toUpperCase()
  return mapValues(result, orders => filter(orders, order => order.exchange.includes(of)))
}

async function getBalances (format) {
  let result = await bittrex.getBalances()
  result = mapValues(result, bs => filter(bs, 'balance'))
  if (format)
    result = mapValues(result, balances => balances.map(balance =>
      mapValues(balance, (v, k) =>
        ['balance', 'available'].includes(k)
          ? String(v.toFixed(16)).replace(/0*$/, '')
          : v
      )
    ))
  return result
}

const ol = {
  orderUuid: '3470fa9e-e6e5-47b6-ac23-f1da41bacd4c',
  exchange: 'BTC-CLAM',
  timeStamp: '2017-09-19T16:40:41.32',
  orderType: 'LIMIT_BUY',
  limit: 0.00202276,
  quantity: 256.43180605,
  quantityRemaining: 0,
  commission: 0.00129673,
  price: 0.51869487,
  pricePerUnit: 0.00202273,
  isConditional: false,
  condition: 'NONE',
  conditionTarget: null,
  immediateOrCancel: false,
  closed: '2017-09-19T16:40:41.897'
}

const o = {
  accountId: null,
  orderUuid: '3470fa9e-e6e5-47b6-ac23-f1da41bacd4c',
  exchange: 'BTC-CLAM',
  type: 'LIMIT_BUY',
  quantity: 256.43180605,
  quantityRemaining: 0,
  limit: 0.00202276,
  reserved: 0.5187,
  reserveRemaining: 0.51869487,
  commissionReserved: 0.00129675,
  commissionReserveRemaining: 2e-8,
  commissionPaid: 0.00129673,
  price: 0.51869487,
  pricePerUnit: 0.00202273,
  opened: '2017-09-19T16:40:41.32',
  closed: '2017-09-19T16:40:41.897',
  isOpen: false,
  sentinel: '3d6d3997-edcc-4df7-9523-f5be520d5dae',
  cancelInitiated: false,
  immediateOrCancel: false,
  isConditional: false,
  condition: 'NONE',
  conditionTarget: null
}

const ol_ =  {
  orderUuid: '7b0f9965-8ef7-4907-ae35-daea0045d41b',
  exchange: 'BTC-ETH',
  timeStamp: '2017-09-21T14:33:29.42',
  orderType: 'LIMIT_SELL',
  limit: 0.07317,
  quantity: 11.80845382,
  quantityRemaining: 0,
  commission: 0.00216452,
  price: 0.86581011,
  pricePerUnit: 0.0733212,
  isConditional: false,
  condition: 'NONE',
  conditionTarget: null,
  immediateOrCancel: false,
  closed: '2017-09-21T14:33:29.543'
}

// console.log(ol)
// console.log(omit(o, keys(ol)))
// console.log(omit(ol, keys(o)))

process.on('unhandledRejection', (reason, error) => {
  console.error(reason)
  throw error
})