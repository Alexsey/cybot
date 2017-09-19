'use strict'

const _ = require('lodash')
const {lowerFirst, isArray, mapKeys} = _
const bb = require('bluebird')
const bittrexRaw = require('node-bittrex-api')

const config = require('../config')

bittrexRaw.options({
  apikey: config.bittrix.credentials[0].key,
  apisecret: config.bittrix.credentials[0].secret.read,
  inverse_callback_arguments: true,
})

module.exports = {
  // public
  getMarkets: async (opts = {}) => {
    const resp = await bb.promisify(bittrexRaw.getmarkets)(opts)
    return resp.success
      ? formatKeys(resp)
      : resp
  },
  getCurrencies: async () => {
    const resp = await bb.promisify(bittrexRaw.getcurrencies)()
    return resp.success
      ? formatKeys(resp)
      : resp
  },
  getTicker: async (opts = {}) => {
    const resp = await bb.promisify(bittrexRaw.getticker)(opts)
    return resp.success
      ? formatKeys(resp)
      : resp
  },
  getMarketSummaries: async (opts = {}) => {
    const resp = await bb.promisify(bittrexRaw.getmarketsummaries)(opts)
    return resp.success
      ? formatKeys(resp)
      : resp
  },
  getMarketSummary: async () => {
    const resp = bb.promisify(bittrexRaw.getmarketsummary)()
    return resp.success
      ? formatKeys(resp)
      : resp
  },
  getOrderBook: async (opts = {}) => {
    const resp = bb.promisify(bittrexRaw.getorderbook)(opts)
    return resp.success
      ? formatKeys(resp)
      : resp
  },
  getMarketHistory: async (opts = {}) => {
    const resp = bb.promisify(bittrexRaw.getmarkethistory)(opts)
    return resp.success
      ? formatKeys(resp)
      : resp
  },
  // Balance
  getBalances: async () => {
    const resp = await bb.promisify(bittrexRaw.getbalances)()
    return resp.success
      ? formatKeys(resp)
      : resp
  },
  getBalance: async (opts = {}) => {
    const resp = await bb.promisify(bittrexRaw.getbalance)(opts)
    return resp.success
      ? formatKeys(resp)
      : resp
  },
  getDepositAddress: async (opts = {}) => {
    const resp = await bb.promisify(bittrexRaw.getdepositaddress)(opts)
    return resp.success
      ? formatKeys(resp)
      : resp
  },
  withdraw: async (opts = {}) => {
    const resp = await bb.promisify(bittrexRaw.withdraw)(opts)
    return resp.success
      ? formatKeys(resp)
      : resp
  },
  getOrder: async (opts = {}) => {
    const resp = await bb.promisify(bittrexRaw.getorder)(opts)
    return resp.success
      ? formatKeys(resp)
      : resp
  },
  getOrderHistory: async (opts = {}) => {
    const resp = await bb.promisify(bittrexRaw.getorderhistory)(opts)
    return resp.success
      ? formatKeys(resp)
      : resp
  },
  getWithdrawalHistory: async (opts = {}) => {
    const resp = await bb.promisify(bittrexRaw.getwithdrawalhistory)(opts)
    return resp.success
      ? formatKeys(resp)
      : resp
  },
  getDepositHistory: async (opts = {}) => {
    const resp = await bb.promisify(bittrexRaw.getdeposithistory)(opts)
    return resp.success
      ? formatKeys(resp)
      : resp
  }
}

function formatKeys (response) {
  const {result} = response
  return isArray(result)
    ? result.map(v => mapKeys(v, (__, k) => lowerFirst(k)))
    : mapKeys(result, (__, k) => lowerFirst(k))
}