'use strict'

const config = {
  periodStartDate: 1,
  bittrexCommission: 0.0025,
  tradersTable: {
    // in hours. Could be float ex. 1/3. Set 0 to use actual time
    currentTimePeriod: 1 / 2,
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
      Alexey: {
        startInUSDT: 2047
      },
      'Alexey 1': {
        startInUSDT: 2047
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
      ETH:   {deposit: 48.85770736, withdrawal: 0},
      XMR:   {deposit: 17.892112288329, withdrawal: 0},
      MUSIC: {deposit: 147991.03859825, withdrawal: 0},
      BCN:   {deposit: 50765.94000000, withdrawal: 0},
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