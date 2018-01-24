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
      ETC:   {deposit: 38.65999737, withdrawal: 0},
      MUSIC: {deposit: 184566.07673240, withdrawal: 0},
      SC:    {deposit: 721797.19044156, withdrawal: 0},
      RCN:   {deposit: 13254.84479378, withdrawal: 0},
      BCN:   {deposit: 1033537.73850005, withdrawal: 0},
      RPX:   {deposit: 14598.1054818, withdrawal: 0},
      ZRX:   {deposit: 4868.02722004, withdrawal: 0},
      TRX:   {deposit: 103806.09, withdrawal: 0},
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