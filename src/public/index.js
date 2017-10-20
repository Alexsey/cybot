'use strict'

let data

window.onload = async () => {
  data = await getData()
  updateTradersTable()
}

async function getData () {
  loader.dataLoading()
  const dataUrl = '/data'
  return new Promise(async (fulfill, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', dataUrl)
    xhr.onloadend = () => {
      loader.disable()
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