'use strict'

const _ = require('lodash')
const {keys, omit, filter} = _
const bittrex = require('./bittrexApi')

;(async () => {
  // const result = await bittrex.getOrder({uuid: '3470fa9e-e6e5-47b6-ac23-f1da41bacd4c'})
  // const result = await bittrex.getOrderHistory()
  // const result = await bittrex.getBalances()
  // console.log(_.filter(result, 'balance'))
  // const result = await bittrex.getDepositHistory({currency: 'ETH'})
  const result = await bittrex.getTicker({market: 'USDT-BTC'})
  console.dir(result, {colors: true})
})()

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