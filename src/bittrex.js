'use strict'

require('util').inspect.defaultOptions.colors = true
require('util').inspect.styles.number = 'cyan'
const _ = require('lodash') || false
const {transform, difference} = _
const bb = require('bluebird')
const rp = require('request-promise')
const app = new (require('koa')) || false
const auth = require('koa-basic-auth') || false
const router = new (require('koa-router')) || false

const {statCredentials, bittrex: {port}} = require('../config')
const bittrex = require('./bittrexApi')
const coinMarketCap = require('./coinMarketCap')

router.get('/data/:role', async ctx => {
  const {role} = ctx.params
  ctx.assert(bittrex.roles[role], 400, `There are no accounts with role "${role}"`)
  const queryParams = (ctx.query.data || '').split(',')
  const invalidQueryParams = difference(
    queryParams, ['markets', 'orders', 'deposits', 'withdrawals', 'balances', 'coinMarketCapRates']
  )
  ctx.assert(!invalidQueryParams.length, 400, `invalid query params ${invalidQueryParams.join(', ')}`)
  const {markets, orders, deposits, withdrawals, balances, coinMarketCapRates}
    = transform(queryParams, (requested, item) => requested[item] = true, {})
  const all = !(markets || orders || deposits || withdrawals || balances)
  ctx.body = await bb.props({
    ...(all || markets) && {marketSummaries: bittrex.roles[role].getMarketSummaries()},
    ...(all || orders) && {orderHistory: bittrex.roles[role].getOrderHistory()},
    ...(all || deposits) && {depositHistory: bittrex.roles[role].getDepositHistory()},
    ...(all || withdrawals) && {withdrawalHistory: bittrex.roles[role].getWithdrawalHistory()},
    ...(all || balances) && {balances: bittrex.roles[role].getBalances()},
    ...(all || coinMarketCapRates) && {coinMarketCapRates: coinMarketCap.rates()}
  })
})

router.get('/data', ctx => {
  ctx.status = 307
  ctx.redirect(`/data/all${ctx.querystring ? `?${ctx.querystring}` : ''}`)
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

app.listen(port, () => console.log(`Server started on ${port}`))

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