'use strict'

const config = {
  periodStartDate: 12,
  miningCurrencies: ['ETH', 'XMR', 'MUSIC'],
  bittrexCommission: 0.0025,
  useFakeMiners: true,
  fakeMiningTable: {
    ETH:   {deposit: 39.091873715868,    withdrawal: 0},
    XMR:   {deposit: 17.892112288329,     withdrawal: 0},
    MUSIC: {deposit: 98875.89930465, withdrawal: 0},
  }
}