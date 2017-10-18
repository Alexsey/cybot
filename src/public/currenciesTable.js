'use strict'

function updateCurrencyTable (traderName) {
  document.getElementById('currencies-table').innerHTML = `
    <div class="loader"></div>
  `

  setTimeout(() => { // hack to wrapper.display = 'none' to execute in time
    const rows = formCurrenciesTableData(data, traderName)
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

      startBalance, startInUSDT,
      startTrade, startTradeInUSDT, startTradePct,

      todayBalance, todayInUSDT,
      todayTrade, todayTradeInUSDT, todayTradePct,

      yesterdayBalance, yesterdayInUSDT,
      yesterdayTrade, yesterdayTradeInUSDT, yesterdayTradePct,

      balance, inUSDT, lastOrderDate
     }, i
    ) => {
      const yesterday = moment().tz('EET').hours(0).minutes(0).seconds(0).subtract(1, 'day')
      const cellButton = lastOrderDate && moment(lastOrderDate).isAfter(yesterday)
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
  }, 30)
}

function formCurrenciesTableData (data, traderName) {
  const {getBalancesAt, getTrade} = bittrexHelpers

  const {rates} = data
  const balances = data.balances[traderName]
  const orderHistory = data.orderHistory[traderName]
  const withdrawalHistory = data.withdrawalHistory[traderName]
  const depositHistory = data.depositHistory[traderName]
  const today = moment().tz('EET').hours(0).minutes(0).seconds(0)
  const yesterday = moment(today).subtract(1, 'day')
  const periodStartDate = moment(today).date(12)
  const traderData = {balances, orderHistory, withdrawalHistory, depositHistory}

  const table = balances.map(({balance, currency}) => {
    const startBalance = getBalancesAt(traderData, periodStartDate, currency)
    const startInUSDT = startBalance * rates[currency]
    const startTrade = getTrade(orderHistory, {currency, after: periodStartDate})
    const startTradeInUSDT = startTrade * rates[currency]
    const startTradePct = startTradeInUSDT / startInUSDT

    const todayBalance = getBalancesAt(traderData, today, currency)
    const todayInUSDT = todayBalance * rates[currency]
    const todayTrade = getTrade(orderHistory, {currency, after: today})
    const todayTradeInUSDT = todayTrade * rates[currency]
    const todayTradePct = todayTradeInUSDT / todayInUSDT

    const yesterdayBalance = getBalancesAt(traderData, yesterday, currency)
    const yesterdayInUSDT = yesterdayBalance * rates[currency]
    const yesterdayTrade = getTrade(orderHistory, {currency, after: yesterday})
    const yesterdayTradeInUSDT = yesterdayTrade * rates[currency]
    const yesterdayTradePct = yesterdayTradeInUSDT / yesterdayInUSDT
    
    const inUSDT = balance * rates[currency]
    const lastOrder = orderHistory.find(o => o.exchange.includes(currency))
    const lastOrderDate = lastOrder && lastOrder.timeStamp

    return {
      currency,

      startBalance, startInUSDT,
      startTrade, startTradeInUSDT, startTradePct,

      todayBalance, todayInUSDT,
      todayTrade, todayTradeInUSDT, todayTradePct,

      yesterdayBalance, yesterdayInUSDT,
      yesterdayTrade, yesterdayTradeInUSDT, yesterdayTradePct,

      balance, inUSDT, lastOrderDate
    }
  }).filter(r => _(r).omit(['currency', 'lastOrderDate']).some(Boolean))

  return _.cloneDeepWith(table, v => {
    if (Number.isNaN(v)) return 0
    if (v == Infinity || v == -Infinity) return 'up'
  })
}