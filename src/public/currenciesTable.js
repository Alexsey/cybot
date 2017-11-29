'use strict'

async function updateCurrencyTable (traderName) {
  document.getElementById('currencies-table').innerHTML = ''

  loader.buildingTable()
  await new Promise(fulfill => setTimeout(fulfill, 30)) // hack to loader.buildingTable() to execute

  const rows = formCurrenciesTableData(data.traders, data.rates, traderName)
  // Yesterday column is containing today's data. Actually it is a
  // 00:00 of today, but in UI it is easier to ready as "Yesterday"
  const headersRow = `
    <div class="row row-delimiter">
      <div class="col-sm-1">
          Currency
      </div>
      <div class="col">
          Yesterday
      </div>
      <div class="col">
          Current
      </div>
    </div>
  `
  const dataRows = rows.map(({
    currency,

    todayBalance, todayInUSDT,
    todayTrade, todayTradeInUSDT,

    balance, inUSDT, lastOrderDate
   }
  ) => {
    const today = moment().tz('EET').hours(0).minutes(0).seconds(0)
    const periodStartDate = today.date() >= config.periodStartDate
      ? moment(today).date(config.periodStartDate)
      : moment(today).subtract(1, 'month').date(config.periodStartDate)
    const cellButton = lastOrderDate && moment(lastOrderDate).isAfter(periodStartDate)
      ? `class="cell-button" onClick="updateOrdersTable('${traderName}', '${currency}')"`
      : ''
    return `
    <div class="row row-bottom-delimiter">
      <div class="col-sm-1 multiline-col">
        <div ${cellButton}>
          ${currency.toUpperCase()}
        </div>
      </div>
      <div class="col">
        <div class="row">
          <div class="col">
            ${formatCoin(todayBalance)}
          </div>
          <div class="col">
            ${formatUSDT(todayInUSDT)}
          </div>
        </div>
        <div class="row">
          <div class="col">
            ${formatCoin(todayTrade)}
          </div>
          <div class="col">
            ${formatUSDT(todayTradeInUSDT)}
          </div>
        </div>
      </div>
      <div class="col">
        <div class="row">
          <div class="col">
            ${formatCoin(balance)}
          </div>
          <div class="col">
            ${formatUSDT(inUSDT)}
          </div>
        </div>
      </div>
    </div>
  `
  }).join('\n')
  document.getElementById('currencies-table').innerHTML = `
    <div class="table-header">Currencies Table</div>
    <div><br></div>
    <div class="container">${headersRow}${dataRows}</div>
  `
  loader.disable()
}

function formCurrenciesTableData (data, rates, traderName) {
  const {getBalancesAt, getTrade} = bittrexHelpers

  const balances = data.balances[traderName]
  const orderHistory = data.orderHistory[traderName]
  const withdrawalHistory = data.withdrawalHistory[traderName]
  const depositHistory = data.depositHistory[traderName]
  const today = moment().tz('EET').hours(0).minutes(0).seconds(0)
  const traderData = {balances, orderHistory, withdrawalHistory, depositHistory}

  return balances
    .map(({balance, currency}) => {
      const todayBalance = getBalancesAt(traderData, today, currency)
      const todayInUSDT = todayBalance * rates[currency]
      const todayTrade = getTrade(orderHistory, {currency, after: today})
      const todayTradeInUSDT = todayTrade * rates[currency]

      const inUSDT = balance * rates[currency]
      const lastOrder = orderHistory.find(o => o.exchange.includes(currency))
      const lastOrderDate = lastOrder && lastOrder.timeStamp

      return {
        currency,

        todayBalance, todayInUSDT,
        todayTrade, todayTradeInUSDT,

        balance, inUSDT, lastOrderDate
      }
    })
    .filter(r => _(r).omit(['currency', 'lastOrderDate'])
    .some(Boolean))
}