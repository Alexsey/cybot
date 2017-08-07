'use strict'

const _ = require('lodash')
const moment = require('moment')

const argv = require('yargs').argv
const {api: {credentials}} = require('../config') // key and secret

const {cookie, userAgent} = argv
const api = require('./api').patchState(credentials, {headers: {cookie, userAgent}})

;(async () => {
  // const resp = await api.returnTradeHistoryPublic('BTC', 'NXT', 1410158341, 1410499372)
  // console.log(resp)
  const resp = await api.returnLendingHistory(+moment().subtract(1, 'day'), +new Date)
  console.log(resp)
})()

// console.log('api.url:', api.url.wamp)
//
// const connection = new autobahn.Connection({
//   url: api.url.wamp,
//   realm: 'realm1'
// })
//
// connection.onopen = function (session) {
//   console.log('opened')
//   session.subscribe('BTC_XMR', marketEvent)
//   session.subscribe('ticker', tickerEvent)
//   session.subscribe('trollbox', trollboxEvent)
//
//   function marketEvent (args, kwargs) {
//     console.log(args)
//   }
//   function tickerEvent (args, kwargs) {
//     console.log(args)
//   }
//   function trollboxEvent (args, kwargs) {
//     console.log(args)
//   }
// }
//
// connection.onclose = function (reason, details) {
//   console.log("\nWebsocket connection closed")
//   console.log('reason:', reason)
//   console.log('details:', details)
// }
//
// connection.open()