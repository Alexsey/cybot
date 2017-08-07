'use strict'

const crypto = require('crypto')

const rp = require('request-promise')
const _ = require('lodash')

const {api} = require('../config')
const {getThrottle, nonce} = require('./utils')
const throttle = getThrottle(api.cpsLimit, 1100)

const state = {}

const defaultHeaders = _.mapKeys(
  {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    acceptEncoding: 'gzip, deflate, br',
    acceptLanguage: 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
    cacheControl: 'max-age=0',
    connection: 'keep-alive',
    host: 'poloniex.com',
    upgradeInsecureRequests: '1',
  },
  (v, k) => formatHttpHeaderName(k)
)

function patchState (...patches) {
  const patch = _.assign(...patches)
  const headers = _.mapKeys(patch.headers, (v, k) => formatHttpHeaderName(k))
  state.headers = _.merge(state.headers, headers)
  _.merge(state, _.pick(patch, 'key', 'secret'))
  return module.exports
}

const privateMethods = _({
  returnBalances: () => ({}),
  returnCompleteBalances: account => ({account}),
  returnDepositAddresses: () => ({}),
  generateNewAddress: currency => ({currency}),
  returnDepositsWithdrawals: (start, end) => ({start, end}),
  returnOpenOrders: (curA, curB) => ({
    currencyPair: _.lowerCase(curA) == 'all' ? 'all' :`${curA}_${curB}`
  }),
  returnTradeHistory: (curA, curB) => ({
    currencyPair: _.lowerCase(curA) == 'all' ? 'all' :`${curA}_${curB}`
  }),
  returnOrderTrades: orderNumber => ({orderNumber}),
  buy: (curA, curB, amount, rate, {fillOrKill, immediateOrCancel, postOnly}) => {
    const params = {currencyPair: `${curA}_${curB}`, amount, rate}
    if (fillOrKill) params.fillOrKill = 1
    if (immediateOrCancel) params.immediateOrCancel = 1
    if (postOnly) params.postOnly = 1
    return params
  },
  sell: (curA, curB, amount, rate, {fillOrKill, immediateOrCancel, postOnly} = {}) => {
    const params = {currencyPair: `${curA}_${curB}`, amount, rate}
    if (fillOrKill) params.fillOrKill = 1
    if (immediateOrCancel) params.immediateOrCancel = 1
    if (postOnly) params.postOnly = 1
    return params
  },
  cancelOrder: orderNumber => ({orderNumber}),
  moveOrder: (orderNumber, rate, {amount, postOnly, immediateOrCancel} = {}) => {
    const params = {orderNumber, rate}
    if (amount != null) params.amount = +amount
    if (postOnly) params.postOnly = 1
    if (immediateOrCancel) params.immediateOrCancel = 1
    return params
  },
  withdraw: (currency, amount, address, {paymentId} = {}) => {
    const params = {currency, amount, address}
    if (paymentId) params.paymentId = paymentId
    return params
  },
  returnFeeInfo: () => ({}),
  returnAvailableAccountBalances: ({account} = {}) => account ? {account} : {},
  returnTradableBalances: () => ({}),
  transferBalance: (currency, amount, fromAccount, toAccount) =>
    ({currency, amount, fromAccount, toAccount}),
  returnMarginAccountSummary: () => ({}),
  marginBuy: (curA, curB, rate, amount, {leadingRate} = {}) => {
    const params = {currencyPair: `${curA}_${curB}`, rate, amount}
    if (leadingRate) params.leadingRate = leadingRate
    return params
  },
  marginSell: (curA, curB, rate, amount, {leadingRate} = {}) => {
    const params = {currencyPair: `${curA}_${curB}`, rate, amount}
    if (leadingRate) params.leadingRate = leadingRate
    return params
  },
  getMarginPosition: (curA, curB) => ({
    currencyPair: _.lowerCase(curA) == 'all' ? 'all' :`${curA}_${curB}`
  }),
  closeMarginPosition: (curA, curB) => ({currencyPair: `${curA}_${curB}`}),
  createLoanOffer: (currency, amount, duration, autoRenew, lendingRate) => ({
    currency, amount, duration, autoRenew: autoRenew ? 1 : 0, lendingRate,
  }),
  cancelLoanOffer: orderNumber => ({orderNumber}),
  returnOpenLoanOffers: () => ({}),
  returnActiveLoans: () => ({}),
  returnLendingHistory: (start, end, {limit} = {}) => {
    const params = {start, end}
    if (limit != null) params.limit = +limit
  },
  toggleAutoRenew: orderNumber => ({orderNumber})
})
  .transform((acc, argsToRequestParams, methodName) =>
    acc[methodName] = (...args) => {
      const params = _.assign(argsToRequestParams(...args), {command: methodName, nonce: nonce()})
      return rp(_.merge({
        url: api.url.private,
        method: 'POST',
        headers: genPrivateHeaders(params),
        form: params,
        json: true,
        gzip: true
      }))
    })
  .mapValues(throttle)
  .value()

const publicMethods = _({
  returnTicker: () => ({}),
  return24hVolume: () => ({}),
  returnCurrencies: () => ({}),
  returnLoanOrders: cur => ({currency: cur}),
  returnOrderBook: (curA, curB, depth) => ({
    currencyPair: _.lowerCase(curA) == 'all' ? 'all' :`${curA}_${curB}`
  }),
  // would be exposed as returnTradeHistoryPublic
  // because there is private method with the same name
  returnTradeHistory: (curA, curB, start, end) =>
    ({start, end, currencyPair: `${curA}_${curB}`}),
  returnChartData: (curA, curB, start, end, period) =>
    ({start, end, period, currencyPair: `${curA}_${curB}`})
})
  .transform((acc, argsToRequestParams, methodName) =>
    acc[methodName] = (...args) => {
      const params = _.assign(argsToRequestParams(...args), {command: methodName})
      return rp(_.merge({
        url: api.url.public,
        method: 'GET',
        headers: genPublicHeaders(),
        qs: params,
        json: true,
        gzip: true
      }))
    })
  .mapValues(throttle)
  .value()

function genPublicHeaders () {
  return _.assign(defaultHeaders, state.headers)
}

function genPrivateHeaders (params) {
  if (!state.key) throw Error('key is not set')
  if (!state.secret) throw Error('secret is not set')

  const paramsString = _.map(params, (v, k) => `${k}=${v}`).join('&')
  const sign = crypto.createHmac('sha512', state.secret).update(paramsString).digest('hex')
  return _.assign(genPublicHeaders(), {Key: state.key, Sign: sign})
}

function formatHttpHeaderName (headerName) {
  return _.words(headerName).map(_.upperFirst).join('-')
}

module.exports = _.assignWith({patchState}, publicMethods, privateMethods,
  (ov, sv, k, o) => {
    if (!ov || !sv) return
    o[`${k}Public`] = ov
    return sv
  }
)