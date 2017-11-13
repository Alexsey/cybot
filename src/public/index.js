'use strict'

let data

window.onload = async () => {
  data = await getData()
  updateTradersTable()
  updateMinersTable()
}

async function getData () {
  loader.dataLoading()

  const data = await Promise.props({
    traders: new Promise(async (fulfill, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', '/data/traders?data=orders,deposits,withdrawals,balances')
      xhr.onerror = () => reject(xhr)
      xhr.onloadend = () => fulfill(JSON.parse(xhr.responseText))
      xhr.send()
    }),
    miners: new Promise(async (fulfill, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', '/data/miners?data=deposits,withdrawals')
      xhr.onerror = () => reject(xhr)
      xhr.onloadend = () => fulfill(JSON.parse(xhr.responseText))
      xhr.send()
    }),
    marketSummaries: new Promise(async (fulfill, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', '/data?data=markets')
      xhr.onerror = () => reject(xhr)
      xhr.onloadend = () => fulfill(JSON.parse(xhr.responseText).marketSummaries)
      xhr.send()
    }),
  })
  data.rates = bittrexHelpers.getRates(data.marketSummaries)

  loader.disable()
  await new Promise(fulfill => setTimeout(fulfill, 30)) // hack to loader.display() to execute

  return data
}