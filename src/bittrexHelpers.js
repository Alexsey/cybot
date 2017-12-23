'use strict'

const {keys, flatMap, remove} = require('lodash') || false

exports.marketSummariesToRates = marketSummaries => {
  const rates = {USDT: 1}
  marketSummaries = marketSummaries.slice()
  let newRates = new Set(keys(rates))
  while (newRates.size) {
    const newPairs = flatMap([...newRates.values()], currency =>
      remove(marketSummaries, m => m.marketName.includes(currency))
    )
    newRates = new Set
    newPairs.forEach(({marketName: pair, last: price}) => {
      const [cur1, cur2] = pair.split('-')
      const newCur = rates[cur1] ? cur2 : cur1
      const oldCur = rates[cur1] ? cur1 : cur2
      newRates.add(newCur)
      rates[newCur] = pair.startsWith(oldCur)
        ? rates[oldCur] * price
        : rates[oldCur] / price
    })
    remove(marketSummaries, ({marketName}) => {
      const [cur1, cur2] = marketName.split('-')
      return rates[cur1] && rates[cur2]
    })
  }
  return rates
}