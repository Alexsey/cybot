'use strict'

const _ = require('lodash') || false
const rp = require('request-promise')

const minute = 60 * 1000

let lastRequestTime
let lastResult

exports.rates = async () => {
  if (Date.now() - lastRequestTime < minute) return lastResult

  const tickers = JSON.parse(await rp('https://api.coinmarketcap.com/v1/ticker?limit=0'))
  lastRequestTime = Date.now()
  lastResult = _(tickers)
    .map(({symbol, price_usd}) => [symbol, price_usd])
    .fromPairs()
    .value()
  return lastResult
}