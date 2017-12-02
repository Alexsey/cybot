'use strict'

let data

window.onload = async () => {
  data = await getData()
  // async long loading tables
  await Promise.all([
    updateTradersTable(),
    updateMinersTables()
  ])
  // fast loading tables
  updateMainAccountTable()
}

async function getData () {
  loader.dataLoading()

  const data = await Promise.props({
    traders: new Promise((fulfill, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', '/data/traders?data=orders,deposits,withdrawals,balances')
      xhr.onerror = () => reject(xhr)
      xhr.onloadend = () => fulfill(JSON.parse(xhr.responseText))
      xhr.send()
    }),
    miners: new Promise((fulfill, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', '/data/miners?data=deposits,withdrawals')
      xhr.onerror = () => reject(xhr)
      xhr.onloadend = () => fulfill(JSON.parse(xhr.responseText))
      xhr.send()
    }),
    common: new Promise((fulfill, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', '/data?data=markets,coinMarketCapRates')
      xhr.onerror = () => reject(xhr)
      xhr.onloadend = () => fulfill(JSON.parse(xhr.responseText))
      xhr.send()
    })
  })
  data.rates = _.defaults(
    bittrexHelpers.getRates(data.common.marketSummaries),
    _.mapValues(data.common.coinMarketCapRates, v => +v)
  )

  loader.disable()
  // hack to loader.display() to execute
  await new Promise(fulfill => setTimeout(fulfill, 30))

  return data
}