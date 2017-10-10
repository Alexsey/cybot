'use strict'

let data

window.onload = async () => {
  data = await getData()
  updateTradersTable()
  updateCurrencyTable(_.keys(data.balances)[0])
}

async function getData () {
  document.getElementById('wrapper').style.display = 'block'
  const dataUrl = '/data'
  return new Promise(async (fulfill, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', dataUrl)
    xhr.onloadend = () => {
      document.getElementById('wrapper').style.display = 'none'
      if (xhr.status == 404) {
        return reject(`data url "${dataUrl}" is broken`)
      }
      setTimeout(() => { // hack to wrapper.display = 'none' to execute in time
        try {
          const data = JSON.parse(xhr.responseText)
          data.rates = bittrexHelpers.getRates(data.marketSummaries)
          fulfill(data)
        } catch (e) {
          reject(e)
      }}, 30)
    }
    xhr.onerror = () => {
      reject(xhr)
    }
    xhr.send()
  })
}