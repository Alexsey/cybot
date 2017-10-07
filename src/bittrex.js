'use strict'

require('util').inspect.defaultOptions.colors = true
require('util').inspect.styles.number = 'cyan'
const _ = require('lodash') || false
const moment = require('moment-timezone') || false
const {
  keys, omit, filter, mapValues, sum, sumBy, groupBy, pick, map, invokeMap,
  round, reject, partition, omitBy, find, orderBy, cloneDeepWith
} = _
const {all: bittrex, first} = require('./bittrexApi')
const {
  getBalancesAt, getRates, getTradeMinMax
} = require('./bittrexHelpers')

;(async () => {
  const [
    marketSummaries,
    orderHistory,
    depositHistory,
    withdrawalHistory,
    balances
  ] = await Promise.all([
    bittrex.getMarketSummaries(),
    bittrex.getOrderHistory(),
    bittrex.getDepositHistory(),
    bittrex.getWithdrawalHistory(),
    bittrex.getBalances()
  ])

  const rates = getRates(marketSummaries)

  const data = {
    orderHistory,
    depositHistory,
    withdrawalHistory,
    balances,
    rates
  }

  // console.log(formGeneralTableData(data))
  console.log(formTraderTableData(data, 'first'))
})()

function formTraderTableData (data, traderName) {
  const {rates} = data
  const balances = data.balances[traderName]
  const orderHistory = data.orderHistory[traderName]
  const withdrawalHistory = data.withdrawalHistory[traderName]
  const depositHistory = data.depositHistory[traderName]
  const today = moment().tz('EET').hours(0).minutes(0).seconds(0)
  const yesterday = moment(today).subtract(1, 'day')
  const periodStartDate = moment(today).date(1)
  const traderData = {balances, orderHistory, withdrawalHistory, depositHistory}

  const table = balances.map(({balance, currency}) => {
    const startBalance = getBalancesAt(traderData, periodStartDate, currency)
    const startInUSDT = startBalance * rates[currency]

    const [startTradeAbs, startMinAbs, startMaxAbs]
      = getTradeMinMax(orderHistory, {currency, after: periodStartDate})
    const startTradeAbsInUSDT = startTradeAbs * rates[currency]
    const startMinAbsInUSDT = startMinAbs * rates[currency]
    const startMaxAbsInUSDT = startMaxAbs * rates[currency]
    const startTradeRel = startTradeAbs + startBalance
    const startMinRel = startMinAbs + startBalance
    const startMaxRel = startMaxAbs + startBalance
    const startTradeRelInUSDT = startMaxAbsInUSDT + startInUSDT
    const startMinRelInUSDT = startMaxAbsInUSDT + startInUSDT
    const startMaxRelInUSDT = startMaxAbsInUSDT + startInUSDT
    const startTradeAbsPct = startTradeAbs / startInUSDT
    const startMinAbsPct = startMinAbs / startInUSDT
    const startMaxAbsPct = startMaxAbs / startInUSDT
    const startMinRelPct = startMinRel / startInUSDT
    const startMaxRelPct = startMaxRel / startInUSDT
    const startTradeRelPct = startTradeRel / startInUSDT
    

    const todayBalance = getBalancesAt(traderData, today, currency)
    const todayInUSDT = todayBalance * rates[currency]

    const [todayTradeAbs, todayMinAbs, todayMaxAbs]
      = getTradeMinMax(orderHistory, {currency, after: today})
    const todayTradeAbsInUSDT = todayTradeAbs * rates[currency]
    const todayMinAbsInUSDT = todayMinAbs * rates[currency]
    const todayMaxAbsInUSDT = todayMaxAbs * rates[currency]
    const todayTradeRel = todayTradeAbs + todayBalance
    const todayMinRel = todayMinAbs + todayBalance
    const todayMaxRel = todayMaxAbs + todayBalance
    const todayTradeRelInUSDT = todayMaxAbsInUSDT + todayInUSDT
    const todayMinRelInUSDT = todayMaxAbsInUSDT + todayInUSDT
    const todayMaxRelInUSDT = todayMaxAbsInUSDT + todayInUSDT
    const todayTradeAbsPct = todayTradeAbs / todayInUSDT
    const todayMinAbsPct = todayMinAbs / todayInUSDT
    const todayMaxAbsPct = todayMaxAbs / todayInUSDT
    const todayMinRelPct = todayMinRel / todayInUSDT
    const todayMaxRelPct = todayMaxRel / todayInUSDT
    const todayTradeRelPct = todayTradeRel / todayInUSDT
    

    const yesterdayBalance = getBalancesAt(traderData, yesterday, currency)
    const yesterdayInUSDT = yesterdayBalance * rates[currency]

    const [yesterdayTradeAbs, yesterdayMinAbs, yesterdayMaxAbs]
      = getTradeMinMax(orderHistory, {currency, after: yesterday})
    const yesterdayTradeAbsInUSDT = yesterdayTradeAbs * rates[currency]
    const yesterdayMinAbsInUSDT = yesterdayMinAbs * rates[currency]
    const yesterdayMaxAbsInUSDT = yesterdayMaxAbs * rates[currency]
    const yesterdayTradeRel = yesterdayTradeAbs + yesterdayBalance
    const yesterdayMinRel = yesterdayMinAbs + yesterdayBalance
    const yesterdayMaxRel = yesterdayMaxAbs + yesterdayBalance
    const yesterdayTradeRelInUSDT = yesterdayMaxAbsInUSDT + yesterdayInUSDT
    const yesterdayMinRelInUSDT = yesterdayMaxAbsInUSDT + yesterdayInUSDT
    const yesterdayMaxRelInUSDT = yesterdayMaxAbsInUSDT + yesterdayInUSDT
    const yesterdayTradeAbsPct = yesterdayTradeAbs / yesterdayInUSDT
    const yesterdayMinAbsPct = yesterdayMinAbs / yesterdayInUSDT
    const yesterdayMaxAbsPct = yesterdayMaxAbs / yesterdayInUSDT
    const yesterdayMinRelPct = yesterdayMinRel / yesterdayInUSDT
    const yesterdayMaxRelPct = yesterdayMaxRel / yesterdayInUSDT
    const yesterdayTradeRelPct = yesterdayTradeRel / yesterdayInUSDT


    const inUSDT = balance * rates[currency]

    return {
      currency,

      startBalance, startInUSDT,

      startTradeAbs, startMinAbs, startMaxAbs,
      startTradeAbsInUSDT, startMinAbsInUSDT, startMaxAbsInUSDT,
      startTradeRel, startMinRel, startMaxRel,
      startTradeRelInUSDT, startMinRelInUSDT, startMaxRelInUSDT,
      startTradeAbsPct, startMinAbsPct, startMaxAbsPct,
      startMinRelPct, startMaxRelPct, startTradeRelPct,


      todayBalance, todayInUSDT,

      todayTradeAbs, todayMinAbs, todayMaxAbs,
      todayTradeAbsInUSDT, todayMinAbsInUSDT, todayMaxAbsInUSDT,
      todayTradeRel, todayMinRel, todayMaxRel,
      todayTradeRelInUSDT, todayMinRelInUSDT, todayMaxRelInUSDT,
      todayTradeAbsPct, todayMinAbsPct, todayMaxAbsPct,
      todayMinRelPct, todayMaxRelPct, todayTradeRelPct,


      yesterdayBalance, yesterdayInUSDT,

      yesterdayTradeAbs, yesterdayMinAbs, yesterdayMaxAbs,
      yesterdayTradeAbsInUSDT, yesterdayMinAbsInUSDT, yesterdayMaxAbsInUSDT,
      yesterdayTradeRel, yesterdayMinRel, yesterdayMaxRel,
      yesterdayTradeRelInUSDT, yesterdayMinRelInUSDT, yesterdayMaxRelInUSDT,
      yesterdayTradeAbsPct, yesterdayMinAbsPct, yesterdayMaxAbsPct,
      yesterdayMinRelPct, yesterdayMaxRelPct, yesterdayTradeRelPct,
      

      balance, inUSDT
    }
  }).filter(r => _(r).omit('currency').some(Boolean))

  return cloneDeepWith(table, v => {
    if (Number.isNaN(v)) return 0
    if (v == Infinity) return 'up'
    return v
  })
}

function formGeneralTableData (data) {
  const {rates} = data
  const today = moment().tz('EET').hours(0).minutes(0).seconds(0)
  const yesterday = moment(today).subtract(1, 'day')
  const periodStartDate = moment(today).date(1)

  const table = _(data.balances).keys().map(traderName => {
    const balances = data.balances[traderName]
    const orderHistory = data.orderHistory[traderName]
    const depositHistory = data.depositHistory[traderName]
    const withdrawalHistory = data.withdrawalHistory[traderName]

    const traderData = {balances, orderHistory, depositHistory, withdrawalHistory}

    const startInUSDT = _(getBalancesAt(traderData, periodStartDate))
      .map((balance, currency) => rates[currency] * balance).sum()
    const startUSDT = getBalancesAt(traderData, periodStartDate, 'USDT')
    const startPositionsInUSDT = startInUSDT - startUSDT

    const [startTradeAbs, startMinAbs, startMaxAbs]
      = getTradeMinMax(orderHistory, {rates, after: periodStartDate})
    const startTradeRel = startTradeAbs + startInUSDT
    const startMinRel = startMinAbs + startInUSDT
    const startMaxRel = startMaxAbs + startInUSDT
    const startTradeAbsPct = startTradeAbs / startInUSDT
    const startMinAbsPct = startMinAbs / startInUSDT
    const startMaxAbsPct = startMaxAbs / startInUSDT
    const startMinRelPct = startMinRel / startInUSDT
    const startMaxRelPct = startMaxRel / startInUSDT
    const startTradeRelPct = startTradeRel / startInUSDT



    const yesterdayInUSDT = _(getBalancesAt(traderData, yesterday))
      .map((balance, currency) => rates[currency] * balance).sum()
    const yesterdayUSDT = getBalancesAt(traderData, yesterday, 'USDT')
    const yesterdayPositionsInUSDT = yesterdayInUSDT - yesterdayUSDT

    const [yesterdayTradeAbs, yesterdayMinAbs, yesterdayMaxAbs]
      = getTradeMinMax(orderHistory, {rates, after: yesterday})
    const yesterdayTradeRel = yesterdayTradeAbs + yesterdayInUSDT
    const yesterdayMinRel = yesterdayMinAbs + yesterdayInUSDT
    const yesterdayMaxRel = yesterdayMaxAbs + yesterdayInUSDT
    const yesterdayTradeAbsPct = yesterdayTradeAbs / yesterdayInUSDT
    const yesterdayMinAbsPct = yesterdayMinAbs / yesterdayInUSDT
    const yesterdayMaxAbsPct = yesterdayMaxAbs / yesterdayInUSDT
    const yesterdayMinRelPct = yesterdayMinRel / yesterdayInUSDT
    const yesterdayMaxRelPct = yesterdayMaxRel / yesterdayInUSDT
    const yesterdayTradeRelPct = yesterdayTradeRel / yesterdayInUSDT


    const todayInUSDT = _(getBalancesAt(traderData, today))
      .map((balance, currency) => rates[currency] * balance).sum()
    const todayUSDT = getBalancesAt(traderData, today, 'USDT')
    const todayPositionsInUSDT = todayInUSDT - todayUSDT

    const [todayTradeAbs, todayMinAbs, todayMaxAbs]
      = getTradeMinMax(orderHistory, {rates, after: today})
    const todayTradeRel = todayTradeAbs + todayInUSDT
    const todayMinRel = todayMinAbs + todayInUSDT
    const todayMaxRel = todayMaxAbs + todayInUSDT
    const todayTradeAbsPct = todayTradeAbs / todayInUSDT
    const todayMinAbsPct = todayMinAbs / todayInUSDT
    const todayMaxAbsPct = todayMaxAbs / todayInUSDT
    const todayMinRelPct = todayMinRel / todayInUSDT
    const todayMaxRelPct = todayMaxRel / todayInUSDT
    const todayTradeRelPct = todayTradeRel / todayInUSDT


    const USDT = find(balances, {currency: 'USDT'}).balance
    const inUSDT = _(balances)
      .map(({currency, balance}) => balance * rates[currency]).sum()
    const positionsInUSDT = inUSDT - USDT

    return {
      traderName,


      startInUSDT, startUSDT, startPositionsInUSDT,

      startTradeAbs, startTradeAbsPct, startTradeRel,
      startTradeRelPct, startMinAbs, startMinAbsPct,
      startMinRel, startMinRelPct, startMaxAbs,
      startMaxAbsPct, startMaxRel, startMaxRelPct,


      yesterdayInUSDT, yesterdayUSDT, yesterdayPositionsInUSDT,

      yesterdayTradeAbs, yesterdayTradeAbsPct, yesterdayTradeRel,
      yesterdayTradeRelPct, yesterdayMinAbs, yesterdayMinAbsPct,
      yesterdayMinRel, yesterdayMinRelPct, yesterdayMaxAbs,
      yesterdayMaxAbsPct, yesterdayMaxRel, yesterdayMaxRelPct,


      todayInUSDT, todayUSDT, todayPositionsInUSDT,

      todayTradeAbsPct, todayTradeAbs, todayTradeRelPct,
      todayTradeRel, todayMinAbs, todayMinAbsPct,
      todayMinRel, todayMinRelPct, todayMaxAbs,
      todayMaxAbsPct, todayMaxRel, todayMaxRelPct,


      inUSDT, positionsInUSDT, USDT,
    }
  }).value()

  const totalStartInUSDT = sumBy(table, 'startInUSDT')
  const totalStartTradeAbs = sumBy(table, 'startTradeAbs')
  const totalYesterdayInUSDT = sumBy(table, 'yesterdayInUSDT')
  const totalYesterdayTradeAbs = sumBy(table, 'yesterdayTradeAbs')
  const totalTodayInUSDT = sumBy(table, 'todayInUSDT')
  const totalTodayTradeAbs = sumBy(table, 'todayTradeAbs')

  table.push({
    traderName: 'total',

    startInUSDT: totalStartInUSDT,
    startUSDT: sumBy(table, 'startUSDT'),
    startPositionsInUSDT: sumBy(table, 'startPositionsInUSDT'),
    startTradeAbs: totalStartTradeAbs,
    startTradeRel: totalStartTradeAbs / totalStartInUSDT,

    yesterdayInUSDT: totalYesterdayInUSDT,
    yesterdayUSDT: sumBy(table, 'yesterdayUSDT'),
    yesterdayPositionsInUSDT: sumBy(table, 'yesterdayPositionsInUSDT'),
    yesterdayTradeAbs: totalYesterdayTradeAbs,
    yesterdayTradeRel: totalYesterdayTradeAbs / totalYesterdayInUSDT,

    todayInUSDT: totalTodayInUSDT,
    todayUSDT: sumBy(table, 'todayUSDT'),
    todayPositionsInUSDT: sumBy(table, 'todayPositionsInUSDT'),
    todayTradeAbs: totalTodayTradeAbs,
    todayTradeRel: totalTodayTradeAbs / totalTodayInUSDT,

    inUSDT: sumBy(table, 'inUSDT'),
    positionsInUSDT: sumBy(table, 'positionsInUSDT'),
    USDT: sumBy(table, 'USDT'),
  })

  return cloneDeepWith(table, v => {
    if (Number.isNaN(v)) return 0
    if (v == Infinity) return 'up'
    return v
  })
}

async function getBalances (format) {
  let result = await bittrex.getBalances()
  result = mapValues(result, bs => filter(bs, 'balance'))
  if (format)
    result = mapValues(result, balances => balances.map(balance =>
      mapValues(balance, (v, k) =>
        ['balance', 'available'].includes(k)
          ? String(v.toFixed(16)).replace(/0*$/, '')
          : v
      )
    ))
  return result
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

const ol =  {
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

// console.log(ol)
// console.log(omit(o, keys(ol)))
// console.log(omit(ol, keys(o)))

process.on('unhandledRejection', (reason, error) => {
  console.error(reason)
  throw error
})