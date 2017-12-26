'use strict'

const _ = require('lodash')
const moment = require('moment')
const {Op: {gte, lt}} = require('sequelize')

const {csvToObj} = require('./utils')
const {Rates} = require('./models')
const dataGrabber = require('./dataGrabber')
const {getMarketSummaries} = require('./bittrexApi').roles.all
const coinMarketCap = require('./coinMarketCap')
const {marketSummariesToRates} = require('./bittrexHelpers')

exports.getRatesAt = async time => {
  return time
    ? await getPastRates(time)
    : await getCurrentRates()
}

async function getPastRates (time) {
  const [{rates: rateBittrex, createdAt} = {}, {rates: rateCmc} = {}]
    = await getRatesDataAt(time)

  return _(csvToObj(rateBittrex))
    .defaults(csvToObj(rateCmc))
    .mapValues(v => +v)
    .defaults({
      __ratesDate__: +createdAt,
      __ratesDateStr__: moment(createdAt).utc().format()
    })
    .value()
}

async function getRatesDataAt (time) {
  const [preRateBittrex, preRateCMC, postRateBittrex, postRateCmc]
    = await Promise.all([
    Rates.findOne({
      where: {source: 'bittrex', createdAt: {[gte]: time}},
      order: [['createdAt', 'ASC']]
    }),
    Rates.findOne({
      where: {source: 'cmc', createdAt: {[gte]: time}},
      order: [['createdAt', 'ASC']]
    }),
    Rates.findOne({
      where: {source: 'bittrex', createdAt: {[lt]: time}},
      order: [['createdAt', 'DESC']]
    }),
    Rates.findOne({
      where: {source: 'cmc', createdAt: {[lt]: time}},
      order: [['createdAt', 'DESC']]
    }),
  ])

  if (!(preRateBittrex && preRateCMC) && !(postRateBittrex && postRateCmc)) {
    await dataGrabber.grab()
    return getRatesDataAt()
  }
  if (!(preRateBittrex && preRateCMC)) return [postRateBittrex, postRateCmc]
  if (!(postRateBittrex && postRateCmc)) return [preRateBittrex, preRateCMC]

  return [
    getClosest(time, preRateBittrex, postRateBittrex),
    getClosest(time, preRateCMC, postRateCmc)
  ]

  function getClosest (time, a, b) {
    if (!a) return b
    if (!b) return a
    return Math.abs(a.createdAt - time) < Math.abs(b.createdAt - time) ? a : b
  }
}

async function getCurrentRates () {
  const [bittrexRates, cmcRates] = await Promise.all([
    (async () => marketSummariesToRates(await getMarketSummaries()))(),
    coinMarketCap.rates()
  ])

  return _(bittrexRates)
    .defaults(cmcRates)
    .mapValues(v => +v)
    .defaults({
      __ratesDate__: Date.now(),
      __ratesDateStr__: moment().utc().format()
    })
    .value()
}