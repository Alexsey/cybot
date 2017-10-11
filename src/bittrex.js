'use strict'

require('util').inspect.defaultOptions.colors = true
require('util').inspect.styles.number = 'cyan'
const _ = require('lodash') || false
const bb = require('bluebird')
const app = new (require('koa')) || false
const auth = require('koa-basic-auth') || false
const router = new (require('koa-router'))

const {statCredentials} = require('../config')
const {all: bittrex} = require('./bittrexApi')

router.get('/data', async ctx => {
  ctx.body = await bb.props({
    marketSummaries: bittrex.getMarketSummaries(),
    orderHistory: bittrex.getOrderHistory(),
    depositHistory: bittrex.getDepositHistory(),
    withdrawalHistory: bittrex.getWithdrawalHistory(),
    balances: bittrex.getBalances()
  })
})

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    if (e.status == 401) {
      ctx.status = 401;
      ctx.set('WWW-Authenticate', 'Basic')
      ctx.body = 'cant haz that'
    } else {
      throw e
    }
  }
})
app.use(auth(statCredentials))
app.use(router.routes())
app.use(require('koa-static')('src/public'))

app.listen(3000, () => console.log('Server started on 3000'))

process.on('unhandledRejection', (reason, error) => {
  console.error(reason)
  throw error
})

// const moment = require('moment-timezone')
// const {getBalancesAt, getRates} = require('./public/bittrexHelpers')
// ;(async () => {
//   const data = await bb.props({
    // marketSummaries: first.getMarketSummaries(),
    // orderHistory: first.getOrderHistory(),
    // depositHistory: first.getDepositHistory(),
    // withdrawalHistory: first.getWithdrawalHistory(),
    // balances: first.getBalances()
  // })

  // const rates = getRates(data.marketSummaries)
  // const today = moment().tz('EET').hours(0).minutes(0).seconds(0)
  // const yesterday = moment(today).subtract(1, 'day')
  // const periodStartDate = moment(today).date(1)

  // console.log(_(data.orderHistory).filter('quantityRemaining').value())
// })()

const order =  {
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