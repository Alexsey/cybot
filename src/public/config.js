'use strict'

const config = {
  periodStartDate: 12,
  miningCurrencies: ['ETH', 'XMR', 'MUSIC'],
  bittrexCommission: 0.0025,
  useFakeMiners: true,
  fakeMiningTable: {
    ETH:   {deposit: 12,    withdrawal: 0.8},
    XMR:   {deposit: 3,     withdrawal: 0.4},
    MUSIC: {deposit: 55000, withdrawal: 150},
  }
}