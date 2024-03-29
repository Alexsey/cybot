'use strict'

const _ = require('lodash')

exports.statCredentials = {
  name: process.env.USER,
  pass: process.env.PASS,
}

exports.poloniex = _.merge({
  url: {
    'wamp': 'wss://api2.poloniex.com',
    'public': 'https://poloniex.com/public',
    'private': 'https://poloniex.com/tradingApi'
  },
  cpsLimit: 6
}, require('./privatePoloniex'))

exports.bittrex = _.merge({
  url: 'https://bittrex.com/api/1.1/',
  port: process.env.PORT || 3000
}, require('./privateBittrex'))

exports.shouldRunGrabber = process.env.SHOULD_RUN_GRABBER

exports.db = require('./db')