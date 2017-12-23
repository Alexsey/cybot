'use strict'

const _ = require('lodash')
const {inRange} = _

const {objToCsv} = require('./utils')
const {Rates} = require('./models')
const bittrex = require('./bittrexApi')
const coinMarketCap = require('./coinMarketCap')
const {marketSummariesToRates} = require('./bittrexHelpers')

module.exports = {
  run: scheduleGrabber,
  grab
}

function scheduleGrabber () {
  setTimeout(() => {
    grab()
    scheduleGrabber()
  }, getNextRun() - Date.now())
}

async function grab () {
  await Promise.all([
    Rates.create({
      source: 'cmc',
      rates: objToCsv(await coinMarketCap.rates())
    }),
    Rates.create({
      source: 'bittrex',
      rates: objToCsv(marketSummariesToRates(
        await bittrex.roles.all.getMarketSummaries()
      ))
    })
  ])
}

function getNextRun () {
  const now = new Date
  const nowMinutes = now.getMinutes()
  const nextRunMinutes =
       inRange(nowMinutes,  0, 15) && 15
    || inRange(nowMinutes, 15, 30) && 30
    || inRange(nowMinutes, 30, 45) && 45
    || inRange(nowMinutes, 45, 60) && 60

  return new Date().setMinutes(nextRunMinutes, 0, 0)
}