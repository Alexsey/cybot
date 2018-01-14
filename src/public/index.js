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

  const tradersTableRowsData = await formTradersTableData(data, data.rates)
  document.getElementById('traders-table').innerHTML = buildTradersTable(tradersTableRowsData)
  loader.disable()

  const minerData = data.getData('miner', 'Vladimir')
  const {depositHistory, withdrawalHistory} = minerData

  const minersTableRowsData = config.minersTable.useFakeData
    ? formMinersTableDataFake(data.rates)
    : formMinersTableData(depositHistory, withdrawalHistory, data.rates)
  document.getElementById('miners-table').innerHTML = buildMinersTable(minersTableRowsData)

  const mainAccountRowsData = await formMinersAccountTableData(minersTableRowsData, minerData, data.rates)
  document.getElementById('main-account-table').innerHTML
    = buildMainAccountTable(mainAccountRowsData)

  loader.disable()
}

async function getData () {
  loader.dataLoading()

  const data = await Promise.props({
    traders: request('data/traders', {data: ['orders', 'deposits', 'withdrawals', 'balances']}),
    // orders and balances are only for temp mainers-account-table
    miners: request('data/miners', {data: ['orders', 'deposits', 'withdrawals', 'balances']}),
    rates: request('rates')
  })

  const ratesHistory = {}
  data.getRatesAt = async at => {
    if (at) at = +at
    if (Math.abs(at - Date.now()) < 60 * 1000) at = undefined

    if (ratesHistory[at]) return ratesHistory[at]
    ratesHistory[at] = request('rates', {at})
    return ratesHistory[at] = await ratesHistory[at]
  }
  data.getRates = () => data.getRatesAt(Date.now())

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

function request (method, route, params) {
  if (!_.isString(route)) [method, route, params] = ['GET', method, route]

  route = route.replace(/^\b(?!\/)/, '/') // ensure leading /
  if (params) {
    params = _(params)
      .mapValues(v => _.isArray(v) ? v.join(',') : v)
      .toPairs()
      .map(([key, value]) => (value != null && value != '') ? `${key}=${value}` : `${key}`)
      .join('&')
    route += (route.includes('?') ? '' : '?') + params
  }

  return new Promise((fulfill, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, route)
    xhr.onerror = () => reject(xhr)
    xhr.onloadend = () => fulfill(JSON.parse(xhr.responseText))
    xhr.send()
  })
}