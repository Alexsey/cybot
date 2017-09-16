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
  buy: (curA, curB, amount, rate, {fillOrKill, immediateOrCancel, postOnly} = {}) => ({
    currencyPair: `${curA}_${curB}`, amount, rate,
    ...fillOrKill && {fillOrKill: 1},
    ...immediateOrCancel && {immediateOrCancel: 1},
    ...postOnly && {postOnly: 1},
  }),
  sell: (curA, curB, amount, rate, {fillOrKill, immediateOrCancel, postOnly} = {}) => ({
    currencyPair: `${curA}_${curB}`, amount, rate,
    ...fillOrKill && {fillOrKill: 1},
    ...immediateOrCancel && {immediateOrCancel: 1},
    ...postOnly && {postOnly: 1},
  }),
  cancelOrder: orderNumber => ({orderNumber}),
  moveOrder: (orderNumber, rate, {amount, postOnly, immediateOrCancel} = {}) => ({
    orderNumber, rate,
    ...amount != null && {amount: +amount},
    ...postOnly && {postOnly: 1},
    ...immediateOrCancel && {immediateOrCancel: 1}
  }),
  withdraw: (currency, amount, address, {paymentId} = {}) => ({
    currency, amount, address,
    ...paymentId && {paymentId: paymentId}
  }),
  returnFeeInfo: () => ({}),
  returnAvailableAccountBalances: ({account} = {}) => account ? {account} : {},
  returnTradableBalances: () => ({}),
  transferBalance: (currency, amount, fromAccount, toAccount) =>
    ({currency, amount, fromAccount, toAccount}),
  returnMarginAccountSummary: () => ({}),
  marginBuy: (curA, curB, rate, amount, {leadingRate} = {}) => ({
    currencyPair: `${curA}_${curB}`, rate, amount,
    ...leadingRate && {leadingRate: leadingRate}
  }),
  marginSell: (curA, curB, rate, amount, {leadingRate} = {}) => ({
    currencyPair: `${curA}_${curB}`, rate, amount,
    ...leadingRate && {leadingRate: leadingRate}
  }),
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
      const params = {...argsToRequestParams(...args), command: methodName, nonce: nonce()}
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
  // todo is depth optional? If it's not - remove ... &&
  returnOrderBook: (curA, curB, depth = curB) =>
    _.lowerCase(curA) == 'all'
      ? {currencyPair: 'all', ...depth && {depth}}
      : {currencyPair: `${_.upperCase(curA)}_${_.upperCase(curB)}`, ...depth && {depth}},
  // would be exposed as returnTradeHistoryPublic
  // because there is private method with the same name
  returnTradeHistory: (curA, curB, start, end) =>
    ({start, end, currencyPair: `${curA}_${curB}`}),
  returnChartData: (curA, curB, start, end, period) =>
    ({start, end, period, currencyPair: `${curA}_${curB}`})
})
  .transform((acc, argsToRequestParams, methodName) =>
    acc[methodName] = (...args) => {
      const params = {...argsToRequestParams(...args), command: methodName}
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
  return {...defaultHeaders, ...state.headers}
}

function genPrivateHeaders (params) {
  if (!state.key) throw Error('key is not set')
  if (!state.secret) throw Error('secret is not set')

  const paramsString = _.map(params, (v, k) => `${k}=${v}`).join('&')
  const sign = crypto.createHmac('sha512', state.secret).update(paramsString).digest('hex')
  return {...genPublicHeaders(), Key: state.key, Sign: sign}
}

function formatHttpHeaderName (headerName) {
  return _.words(headerName).map(_.upperFirst).join('-')
}

module.exports = _.assignWith({patchState}, publicMethods, privateMethods,
  (ov, sv, k, o) => {
    if (ov) o[`${k}Public`] = ov
    return sv
  }
)