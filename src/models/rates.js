'use strict'

const Sequelize = require('sequelize')

module.exports = {
  source: Sequelize.ENUM('bittrex', 'cmc'),
  rates: Sequelize.TEXT
}