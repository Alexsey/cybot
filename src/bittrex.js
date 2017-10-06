'use strict'

require('util').inspect.defaultOptions.colors = true
require('util').inspect.styles.number = 'cyan'
const _ = require('lodash') || false
const moment = require('moment-timezone') || false
const {
  keys, omit, filter, mapValues, sum, sumBy, groupBy, pick, map, invokeMap,
  round, reject, partition, omitBy, find, orderBy
} = _
const {all: bittrex, first} = require('./bittrexApi')
const {
  getBalancesAt, getRates, getTrade
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

  console.log(formGeneralTableData(data))
})()

function formTraderTableData (data, traderName) {
  const {rates} = data
  const {balances} = data[traderName]
  const {orderHistory} = data[traderName]
  const today = moment().tz('EET').hours(0).minutes(0).seconds(0)
  const yesterday = moment(today).subtract(1, 'day')
  const periodStartDate = moment(today).date(1)
  const traderData = {balances, orderHistory}

  const table = balances.map(({balance, currency}) => {
    const startUSDT = getBalancesAt(traderData, periodStartDate, 'USDT')

    const USDT = find(balances, {currency: 'USDT'}).balance
    const inUSDT = balance * rates[currency]

    const balanceToday = getBalancesAt(traderData, today, currency)
    const inUSDTToday = balanceToday * rates[currency]
    const todayRate = balance / balanceToday || 0
    const todayDiff = balance - balanceToday
    const todayDiffInUSDT = todayDiff * rates[currency]

    const balanceYesterday = getBalancesAt(traderData, yesterday, currency)
    const yesterdayRate = balance / balanceYesterday || 0

    const commissionsInUSDTToday = _(orderHistory)
      .filter(o => moment(o.timeStamp).isAfter(today))
      .filter(o => o.exchange.includes(currency))
      .sumBy(({exchange, commission}) => {
        const currency = exchange.match(/^\w+/)[0]
        return rates[currency] * commission
      })

    const net = inUSDT - inUSDTToday - commissionsInUSDTToday

    const open = _(orderHistory)
      .reject('closed')
      .filter(o => o.exchange.includes(currency))
      .sumBy(({exchange, orderType, price, quantity}) => {
        const [[currency], amount] = orderType.match(/buy/i)
          ? [exchange.match(/^\w+/), price]
          : [exchange.match(/\w+$/), quantity]
        return rates[currency] * amount
      })

    return {
      currency,
      startUSDT,
      balance,
      inUSDT,
      USDT,
      todayRate,
      todayDiff,
      todayDiffInUSDT,
      yesterdayRate,
      commissionsInUSDTToday,
      net,
      open
    }
  }).filter(raw =>
    raw.startUSDT || raw.balance || raw.todayDiff
  )

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

    const USDT = find(balances, {currency: 'USDT'}).balance
    const inUSDT = _(balances)
      .map(({currency, balance}) => balance * rates[currency]).sum()
    const positionsInUSDT = inUSDT - USDT

    const startInUSDT = _(getBalancesAt(traderData, periodStartDate))
      .map((balance, currency) => rates[currency] * balance).sum()
    const startUSDT = getBalancesAt(traderData, periodStartDate, 'USDT')
    const startPositionsInUSDT = startInUSDT - startUSDT
    const startTrade = getTrade(orderHistory, {rates, after: periodStartDate})
    const startRate = startInUSDT ? startTrade / startInUSDT : 'up'

    const todayInUSDT = _(getBalancesAt(traderData, today))
      .map((balance, currency) => rates[currency] * balance).sum()
    const todayUSDT = getBalancesAt(traderData, today, 'USDT')
    const todayPositionsInUSDT = todayInUSDT - todayUSDT
    const todayTrade = getTrade(orderHistory, {rates, after: today})
    const todayRate = todayInUSDT ? todayTrade / todayInUSDT : 'up'

    const yesterdayInUSDT = _(getBalancesAt(traderData, yesterday))
      .map((balance, currency) => rates[currency] * balance).sum()
    const yesterdayUSDT = getBalancesAt(traderData, yesterday, 'USDT')
    const yesterdayPositionsInUSDT = yesterdayInUSDT - yesterdayUSDT
    const yesterdayTrade = getTrade(orderHistory, {rates, after: yesterday})
    const yesterdayRate = yesterdayInUSDT ? yesterdayTrade / yesterdayInUSDT : 'up'

    return {
      traderName,

      startInUSDT,
      startUSDT,
      startPositionsInUSDT,
      startTrade,
      startRate,

      yesterdayInUSDT,
      yesterdayUSDT,
      yesterdayPositionsInUSDT,
      yesterdayTrade,
      yesterdayRate,

      todayInUSDT,
      todayUSDT,
      todayPositionsInUSDT,
      todayTrade,
      todayRate,

      inUSDT,
      positionsInUSDT,
      USDT,
    }
  }).value()

  const totalStartInUSDT = sumBy(table, 'startInUSDT')
  const totalStartTrade = sumBy(table, 'startTrade')
  const totalYesterdayInUSDT = sumBy(table, 'yesterdayInUSDT')
  const totalYesterdayTrade = sumBy(table, 'yesterdayTrade')
  const totalTodayInUSDT = sumBy(table, 'todayInUSDT')
  const totalTodayTrade = sumBy(table, 'todayTrade')

  table.push({
    traderName: 'total',

    startInUSDT: totalStartInUSDT,
    startUSDT: sumBy(table, 'startUSDT'),
    startPositionsInUSDT: sumBy(table, 'startPositionsInUSDT'),
    startTrade: totalStartTrade,
    startRate: totalStartInUSDT ? totalStartTrade / totalStartInUSDT : 'up',

    yesterdayInUSDT: totalYesterdayInUSDT,
    yesterdayUSDT: sumBy(table, 'yesterdayUSDT'),
    yesterdayPositionsInUSDT: sumBy(table, 'yesterdayPositionsInUSDT'),
    yesterdayTrade: totalYesterdayTrade,
    yesterdayRate: totalYesterdayInUSDT ? totalYesterdayTrade / totalYesterdayInUSDT : 'up',

    todayInUSDT: totalTodayInUSDT,
    todayUSDT: sumBy(table, 'todayUSDT'),
    todayPositionsInUSDT: sumBy(table, 'todayPositionsInUSDT'),
    todayTrade: totalTodayTrade,
    todayRate: totalTodayInUSDT ? totalTodayTrade / totalTodayInUSDT : 'up',

    inUSDT: sumBy(table, 'inUSDT'),
    positionsInUSDT: sumBy(table, 'positionsInUSDT'),
    USDT: sumBy(table, 'USDT'),
  })

  return table
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