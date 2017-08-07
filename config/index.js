'use strict'

const _ = require('lodash')

exports.api = {
  url: {
    'wamp': 'wss://api2.poloniex.com',
    'public': 'https://poloniex.com/public',
    'private': 'https://poloniex.com/tradingApi'
  },
  cpsLimit: 6
}

_.merge(exports, require('./envConfig'))