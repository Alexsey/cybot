'use strict'

const config = {
  periodStartDate: 12,
  bittrexCommission: 0.0025,
  minersTable: {
    currencies: ['ETH', 'XMR', 'MUSIC'],
    useFakeData: true,
    fakeData: {
      ETH:   {deposit: 42.854823715868, withdrawal: 0},
      XMR:   {deposit: 17.892112288329, withdrawal: 0},
      MUSIC: {deposit: 117548.96146659, withdrawal: 0},
    }
  },
  minersAccountTable: {
    total: 26953
  },
  mainAccountTable: {
    start: 15500,
    yesterday: 16367,
    current: 16885 
  }
}