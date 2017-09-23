'use strict'

require('util').inspect.defaultOptions.colors = true
require('util').inspect.styles.number = 'cyan'
const _ = require('lodash') || false
const moment = require('moment')
const {keys, omit, filter, mapValues, sum, sumBy, groupBy, pick, map} = _
const {all: bittrex} = require('./bittrexApi')

;(async () => {
  // const result = await bittrex.getOrder({uuid: '3470fa9e-e6e5-47b6-ac23-f1da41bacd4c'})

  // const result = await bittrex.getOrderHistory()
  const {first: firstEthDepositHistory} = await bittrex.getDepositHistory({currency: 'ETH'})
  const {first: firstEthWithdrawalHistory} = await bittrex.getWithdrawalHistory({currency: 'ETH'})
  const {first: {balance}} = await bittrex.getBalance({currency: 'ETH'})
  // const result = await bittrex.getTicker({market: 'USDT-BTC'})
  // console.dir(result, {colors: true})
  // console.dir(await getBalances(true), {colors: true})

  const {first: firstEthOrders} = await getOrderHistory('ETH')
  const [buyOrders, sellOrders] = _(firstEthOrders).partition(v =>
    v.exchange.startsWith('ETH') && v.orderType.endsWith('SELL')
    || v.exchange.endsWith('ETH') && v.orderType.endsWith('BUY')
  )

  const buy = sum([
    sumBy(buyOrders.filter(o => o.exchange.startsWith('ETH')), 'price'),
    sumBy(buyOrders.filter(o => o.exchange.endsWith('ETH')), 'quantity')
  ])
  const sell = sum([
    sumBy(sellOrders.filter(o => o.exchange.startsWith('ETH')), 'price'),
    sumBy(sellOrders.filter(o => o.exchange.endsWith('ETH')), 'quantity')
  ])
  // const commission = sumBy(buyOrders, 'commission') // 0.3257
  // const commission = sumBy(sellOrders, 'commission') // 0.27072
  // const commission = sum([
  //   sumBy(buyOrders.filter(o => o.orderType.endsWith('SELL')), 'commission'),
  //   sumBy(sellOrders.filter(o => o.orderType.endsWith('BUY')), 'commission')
  // ]) // 0.7976
  // const commission = sum([
  //   sumBy(buyOrders.filter(o => o.orderType.endsWith('BUY')), 'commission'),
  //   sumBy(sellOrders.filter(o => o.orderType.endsWith('SELL')), 'commission')
  // ]) // -0.2011
  const txCost = sum([
    sumBy(firstEthDepositHistory, 'txCost'),
    sumBy(firstEthWithdrawalHistory, 'txCost')
  ])
  const deposit = sumBy(firstEthDepositHistory, 'amount')
  const withdrawal = sumBy(firstEthWithdrawalHistory, 'amount')

  console.log(firstEthDepositHistory)

  console.log('balance:', balance)
  console.log('deposit:', deposit)
  console.log('withdrawal:', withdrawal)
  console.log('txCost:', txCost)
  console.log('buy:', buy)
  console.log('sell:', sell)
  console.log('commission:', commission)

  console.log(balance + deposit +  buy - withdrawal - txCost - sell - commission)

  // console.dir(firstEthOrders)

  // console.dir(sellOrders)
  // console.log('\n\n\n\n\n')
  // console.dir(map(buyOrders, v => pick(v, ['timeStamp', 'exchange', 'orderType', 'quantity', 'price', 'pricePerUnit'])))
  // console.dir(buyOrders)
  // console.dir(firstEthDepositHistory)
  // console.log('buy total:', buy)
  // console.log('balance:', firstEthBalance.balance)
  // console.log('sell total:', sell)

  // const todayOrders = firstEthOrders.filter(o => moment(o.timeStamp).isAfter('2017-09-21'))
  // console.dir(todayOrders)

  // console.log(commission, quantity)
  // console.dir(firstEthOrders, {colors: true})
  // console.dir((await getOrderHistory()).first.length, {colors: true})

  // console.dir(filter((await bittrex.getOrderHistory()).first, 'quantityRemaining'), {colors: true})
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

// console.log(ol)
// console.log(omit(o, keys(ol)))
// console.log(omit(ol, keys(o)))

process.on('unhandledRejection', (reason, error) => {
  console.error(reason)
  throw error
})