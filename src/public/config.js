'use strict'

const config = {
  periodStartDate: 12,
  miningCurrencies: ['ETH', 'XMR', 'MUSIC'],
  bittrexCommission: 0.0025,
  useFakeMiners: false,
  fakeMiningTable: {
    ETH:   {deposit: 10,    withdrawal: 0.2},
    XMR:   {deposit: 2,     withdrawal: 0.3},
    MUSIC: {deposit: 53000, withdrawal: 78},
  }
}