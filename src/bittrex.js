'use strict'

require('util').inspect.defaultOptions.colors = true
require('util').inspect.styles.number = 'cyan'
const _ = require('lodash') || false
const moment = require('moment')
const {
  keys, omit, filter, mapValues, sum, sumBy, groupBy, pick, map, invokeMap,
  round, reject, partition, omitBy, find, orderBy
} = _
const {all: bittrex, first} = require('./bittrexApi')
const {getBalancesAt, calcTotals, getBuySellOrders, getRates, getCommission} = require('./bittrexHelpers')

;(async () => {
  const [
    marketSummaries,
    orderHistory,
    // depositHistory,
    // withdrawalHistory,
    balances
  ] = await Promise.all([
    bittrex.getMarketSummaries(),
    bittrex.getOrderHistory(),
    // bittrex.getDepositHistory(),
    // bittrex.getWithdrawalHistory(),
    bittrex.getBalances()
  ])

  const rates = getRates(marketSummaries)

  const firstData = {
    orderHistory,
    // depositHistory,
    // withdrawalHistory,
    balances,
    rates
  }

  console.log(formGeneralTableData(firstData))
  // console.log(calcTotals(firstData))
})()

function formGeneralTableData (data) {
  const {rates} = data
  const today = getToday()
  const yesterday = getYesterday()

  const table = _(data.balances).keys().map(traderName => {
    const balances = data.balances[traderName]
    const orderHistory = data.orderHistory[traderName]
    const openOrders = reject(orderHistory, 'closed')

    const traderData = {balances, orderHistory}

    const periodStartDate = getCurrentReportPeriodStart()
    const startPeriodUSDT = getBalancesAt(traderData, periodStartDate, 'USDT')

    const positionsInUSDT = _(balances)
      .reject({currency: 'USDT'})
      .sumBy(({currency, balance}) => balance * rates[currency])

    const USDT = find(balances, {currency: 'USDT'}).balance
    const inUSDT = positionsInUSDT + USDT

    const USDTToday = getBalancesAt(traderData, today, 'USDT')
    const inUSDTToday = _(getBalancesAt(traderData, today))
      .map((balance, currency) => rates[currency] * balance)
      .sum()
    const USDTTodayRate = USDT / USDTToday
    const USDTTodayDiff = USDT - USDTToday


    const USDTYesterday = getBalancesAt(traderData, yesterday, 'USDT')
    const USDTYesterdayRate = USDT / USDTYesterday

    const commissionsInUSDTToday = _(orderHistory)
      .filter(o => moment(o.timeStamp).isAfter(today))
      .sumBy(({exchange, commission}) => {
        const currency = exchange.match(/^\w+/)[0]
        return rates[currency] * commission
      })

    const net = inUSDT - inUSDTToday - commissionsInUSDTToday

    const open = sumBy(openOrders, ({exchange, orderType, price, quantity}) => {
      const [[currency], amount] = orderType.match(/buy/i)
        ? [exchange.match(/^\w+/), price]
        : [exchange.match(/\w+$/), quantity]
      return rates[currency] * amount
    })

    return {
      traderName,
      startPeriodUSDT,
      positionsInUSDT,
      USDT,
      USDTToday,
      USDTYesterday,
      USDTTodayRate,
      USDTTodayDiff,
      USDTYesterdayRate,
      commissionsInUSDTToday,
      net,
      open
    }
  }).value()

  table.push({
    traderName: 'total',
    startPeriodUSDT: sumBy(table, 'startPeriodUSDT'),
    positionsInUSDT: sumBy(table, 'positionsInUSDT'),
    USDT: sumBy(table, 'USDT'),
    USDTTodayRate: sumBy(table, 'USDT') / sumBy(table, 'USDTToday'),
    USDTTodayDiff: sumBy(table, 'USDTTodayDiff'),
    USDTYesterdayRate: sumBy(table, 'USDT') / sumBy(table, 'USDTYesterday'),
    commissionsInUSDTToday: sumBy(table, 'commissionsInUSDTToday'),
    net: sumBy(table, 'net'),
    open: sumBy(table, 'open'),
  })

  return table.map(raw => omit(raw, ['USDTToday', 'USDTYesterday']))


  function getCurrentReportPeriodStart () {
    return moment().date() >= 5
      ? moment().date(5).hour(6).minute(0).second(0)
      : moment().subtract(1, 'month').date(5).hour(6).minute(0).second(0)
  }

  function getToday () {
    return moment().hour() >= 6
      ? moment().hour(6).minute(0).second(0)
      : moment().subtract(1, 'day').hour(6).minute(0).second(0)
  }

  function getYesterday () {
    return getToday().subtract(1, 'day')
  }
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