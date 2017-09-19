'use strict'

const _ = require('lodash')

exports.poloniex = _.merge({
  url: {
    'wamp': 'wss://api2.poloniex.com',
    'public': 'https://poloniex.com/public',
    'private': 'https://poloniex.com/tradingApi'
  },
  cpsLimit: 6
}, require('./privatePoloniex'))

exports.bittrix = _.merge({
  url: 'https://bittrex.com/api/1.1/'
}, require('./privateBittrix'))

exports.db = require('./db')