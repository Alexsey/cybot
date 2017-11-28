'use strict'

const config = {
  periodStartDate: 12,
  miningCurrencies: ['ETH', 'XMR', 'MUSIC'],
  bittrexCommission: 0.0025,
  useFakeMiners: true,
  fakeMiningTable: {
    ETH:   {deposit: 41.092573715868,    withdrawal: 0},
    XMR:   {deposit: 17.892112288329,     withdrawal: 0},
    MUSIC: {deposit: 111286.13196897, withdrawal: 0},
    ZEC:   {deposit: 0.4604, withdrawal: 0},
  }
}
