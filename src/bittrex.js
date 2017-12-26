'use strict'

require('util').inspect.defaultOptions.colors = true
require('util').inspect.styles.number = 'cyan'
const _ = require('lodash') || false
const {transform, difference} = _
const bb = require('bluebird')
const moment = require('moment')
const app = new (require('koa')) || false
const auth = require('koa-basic-auth') || false
const router = new (require('koa-router')) || false

;(async () => {
  await require('./models')
  const {statCredentials, bittrex: {port}, shouldRunGrabber} = require('../config')
  const bittrex = require('./bittrexApi')
  const coinMarketCap = require('./coinMarketCap')
  const dataGrabber = require('./dataGrabber')
  const {getRatesAt} = require('./ratesProvider')

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
    const all = !(markets || orders || deposits || withdrawals || balances || coinMarketCapRates)
    ctx.body = await bb.props({
      ...(all || markets) && {marketSummaries: bittrex.roles[role].getMarketSummaries()},
      ...(all || orders) && {orderHistory: bittrex.roles[role].getOrderHistory()},
      ...(all || deposits) && {depositHistory: bittrex.roles[role].getDepositHistory()},
      ...(all || withdrawals) && {withdrawalHistory: bittrex.roles[role].getWithdrawalHistory()},
      ...(all || balances) && {balances: bittrex.roles[role].getBalances()},
      ...(all || coinMarketCapRates) && {coinMarketCapRates: coinMarketCap.rates()}
    })
  })

  router.get('/rates', async ctx => {
    const at = ctx.query.at && +moment(+ctx.query.at || ctx.query.at)
    console.log(at)
    const {of} = ctx.query
    switch (of) {
      case undefined: return ctx.body = await getRatesAt(at)
      case 'bittrex': return ctx.throw('not implemented')
      case 'cmc': return ctx.throw('not implemented')
      default: ctx.throw(`invalid rates source "${of}". Available are "bittrex", "cmc" or no value`)
    }
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

  if (shouldRunGrabber) dataGrabber.run()
})()

process.on('unhandledRejection', (reason, error) => {
  console.error(reason)
  throw error
})