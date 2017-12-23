'use strict'

let data

window.onload = async () => {
  data = await getData()

  document.getElementById('miners-table').innerHTML = ''
  document.getElementById('miners-account-table').innerHTML = ''
  document.getElementById('traders-table').innerHTML = ''
  document.getElementById('miners-account-table').innerHTML = ''

  loader.buildingTable()
  loader.buildingTable()

  await new Promise(fulfill => setTimeout(fulfill, 30)) // hack to loader.buildingTable() to execute

  const tradersTableRowsData = formTradersTableData(data, data.rates)
  document.getElementById('traders-table').innerHTML = buildTradersTable(tradersTableRowsData)
  loader.disable()

  const minerData = data.getData('miner', 'Vladimir')
  const {depositHistory, withdrawalHistory} = minerData

  const minersTableRowsData = config.minersTable.useFakeData
    ? formMinersTableDataFake(data.rates)
    : formMinersTableData(depositHistory, withdrawalHistory, data.rates)
  document.getElementById('miners-table').innerHTML = buildMinersTable(minersTableRowsData)

  const mainAccountRowsData = formMinersAccountTableData(minersTableRowsData, minerData, data.rates)
  document.getElementById('main-account-table').innerHTML
    = buildMainAccountTable(mainAccountRowsData)

  loader.disable()
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
      // orders and balances are only for temp mainers-account-table
      xhr.open('GET', '/data/miners?data=orders,deposits,withdrawals,balances')
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

  data.getData = (role, name) => ({
    balances         : data[`${role}s`].balances[name],
    orderHistory     : data[`${role}s`].orderHistory[name],
    depositHistory   : data[`${role}s`].depositHistory[name],
    withdrawalHistory: data[`${role}s`].withdrawalHistory[name]
  })

  data.getNames = role => _.keys(data[role].balances)

  loader.disable()
  // hack to loader.display() to execute
  await new Promise(fulfill => setTimeout(fulfill, 30))

  return data
}