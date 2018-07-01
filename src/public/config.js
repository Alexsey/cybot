'use strict'

const config = {
  periodStartDate: 1,
  bittrexCommission: 0.0025,
  tradersTable: {
    // in hours. Could be float ex. 1/3. Set 0 to use actual time
    currentTimePeriod: 0,
    useFakeData: true,
    fakeData: {
      Stanislav: {
        startInUSDT: 7000
      },
      Yaroslav: {
        startInUSDT: 2020
      },
      Dmitriy: {
        startInUSDT: 318
      },
      'Main Account': {
        startInUSDT: 108000
      },
      'Mining Account': {
        startInUSDT: 0
      },
    }
  },
  ordersTable: {
    historyDepth: 7, // days
  },
  minersTable: {
    currencies: ['ETH', 'XMR', 'MUSIC'],
    useFakeData: true,
    fakeData: {
      ETC:   {deposit: 357.22839952, withdrawal: 0},
      MUSIC: {deposit: 288153.35302582, withdrawal: 0},
      ETH:   {deposit: 56.70712666, withdrawal: 0},
      XMR:   {deposit: 17.892112288329, withdrawal: 0},
      RVN:   {deposit: 227975.2445846733, withdrawal: 0},

    }
  },
  minersAccountTable: {
    total: 0
  },
  mainAccountTable: {
    start: 10000,
    yesterday: 0,
    current: 0,
  }
}