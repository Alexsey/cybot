'use strict'

const config = {
  periodStartDate: 12,
  bittrexCommission: 0.0025,
  minersTable: {
    currencies: ['ETH', 'XMR', 'MUSIC'],
    useFakeData: true,
    fakeData: {
      ETH:   {deposit: 42.092863715868, withdrawal: 0},
      XMR:   {deposit: 17.892112288329, withdrawal: 0},
      MUSIC: {deposit: 113250.23108865, withdrawal: 0},
    }
  },
  minersAccountTable: {
    total: 0
  },
  mainAccountTable: {
    start: 15500,
    yesterday: 0,
    current: 0
  }
}