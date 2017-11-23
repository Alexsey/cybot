'use strict'

const config = {
  periodStartDate: 12,
  miningCurrencies: ['ETH', 'XMR', 'MUSIC'],
  bittrexCommission: 0.0025,
  useFakeMiners: true,
  fakeMiningTable: {
    ETH:   {deposit: 40.091569585868,    withdrawal: 0},
    XMR:   {deposit: 17.892112288329,     withdrawal: 0},
    MUSIC: {deposit: 100188.83993855, withdrawal: 0},
  }
}