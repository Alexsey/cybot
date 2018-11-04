'use strict'

exports.credentials = [{
//   name: 'Main Account',
//   roles: ['trader'],
//   key: process.env.BX_MAIN_KEY,
//   secrets: {
//     read: process.env.BX_MAIN_READ
//   }
// }, {
  name: 'Mining Account',
  roles: ['trader'],
  key: process.env.BX_MINING_KEY,
  secrets: {
      read: process.env.BX_MINING_READ
  }
}, {
  name: 'Alex Account',
  roles: ['trader'],
  key: process.env.BX_ALEX_KEY,
  secrets: {
    read: process.env.BX_ALEX_READ
  }
}]