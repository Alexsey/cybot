'use strict'

const _ = require('lodash')
const moment = require('moment')

const argv = require('yargs').argv
const config = require('../config')

const {cookie, userAgent} = argv
const poloniex = require('./poloniexApi').patchState(
  config.poloniex.credentials,
  {headers: {cookie, userAgent}}
)

;(async () => {
  const resp = await poloniex.returnTradeHistoryPublic('BTC', 'NXT', 1410158341, 1410499372)
  // const resp = await api.returnLendingHistory(+moment().subtract(1, 'day'), +new Date)
  console.log(resp)
})()