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
      Test: {
        startInUSDT: 318
      },
      Alexey: {
        startInUSDT: 493
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
      ETH:   {deposit: 46.856513715869, withdrawal: 0},
      XMR:   {deposit: 17.892112288329, withdrawal: 0},
      MUSIC: {deposit: 139965.37390818, withdrawal: 0},
      BCN:   {deposit: 50765.94000000, withdrawal: 0},
    }
  },
  minersAccountTable: {
    total: 44731
  },
  mainAccountTable: {
    start: 10000,
    yesterday: 29187,
    current: 31935
  }
}