'use strict'

const config = {
  periodStartDate: 12,
  bittrexCommission: 0.0025,
  tradersTable: {
    useFakeData: true,
    fakeData: {
      Stanislav: {
        startInUSDT: 12585
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
  minersTable: {
    currencies: ['ETH', 'XMR', 'MUSIC'],
    useFakeData: true,
    fakeData: {
      ETH:   {deposit: 42.854823715868, withdrawal: 0},
      XMR:   {deposit: 17.892112288329, withdrawal: 0},
      MUSIC: {deposit: 119529.03493901, withdrawal: 0},
      BCN:   {deposit: 50765.94000000 , withdrawal: 0},
    }
  },
  minersAccountTable: {
    total: 30946
  },
  mainAccountTable: {
    start: 15500,
    yesterday: 16741,
    current: 20723 
  }
}