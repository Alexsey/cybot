'use strict'

const Sequelize = require('sequelize') || false

const {db} = require('./../../config') || false

const sequelize = new Sequelize(
  db.base, db.user, db.pass, {
    host: db.host,
    dialect: 'mysql',
    pool: {max: 100, min: 0, idle: 10000},
    dialectOptions: {
      charset: 'utf8_general_ci',
    }
  }
)

module.exports = (async () => {
  await sequelize.authenticate()

  const Rates = sequelize.define('Rates', require('./rates'))

  await sequelize.sync()

  return exports = {
    sequelize,
    Rates
  }
})()

module.exports.then(models =>
  Object.assign(module.exports, models)
)