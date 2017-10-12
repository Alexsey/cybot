'use strict'

function updateTradersTable () {
  document.getElementById('traders-table').innerHTML = `
    <div class="loader"></div>
  `

  setTimeout(() => { // hack to wrapper.display = 'none' to execute in time
    const rows = formTradersTableData(data)
    const headersRow = `
      <div class="row row-delimiter">
        <div class="col-sm-1">
            Trader Name
        </div>
        <div class="col">
            Start
        </div>
        <div class="col">
            Yesterday
        </div>
        <div class="col">
            Today
        </div>
        <div class="col">
            Current
        </div>
      </div>
    `
    const dataRows = rows.map(({
        traderName,

        startInUSDT, startUSDT, startPositionsInUSDT,
        startTrade, startTradePct,

        yesterdayInUSDT, yesterdayUSDT, yesterdayPositionsInUSDT,
        yesterdayTrade, yesterdayTradePct,

        todayInUSDT, todayUSDT, todayPositionsInUSDT,
        todayTrade, todayTradePct,

        inUSDT, positionsInUSDT, USDT,
     }, i
    ) => {
      // IDE can't highlight it properly if put cellButton inside template
      const cellButton = i == rows.length - 1
        ? ''
        : `class="cell-button" onClick="(() => {
            updateCurrencyTable('${traderName}');
            hideOrdersTable();
          })()"`
      return `
      <div class="row row-bottom-delimiter">
        <div class="col-sm-1 multiline-col">
          <div ${cellButton}>
            ${_.upperFirst(traderName)}
          </div>
        </div>
        <div class="col">
          <div class="row">
            <div class="col">
              ${formatUSDT(startInUSDT)}
            </div>
          </div>
          <div class="row">
            <div class="col">
              ${formatCoinInUSDT(startPositionsInUSDT)}
            </div>
            <div class="col">
              ${formatUSDT(startUSDT)}
            </div>
          </div>
          <div class="row">
            <div class="col">
              ${formatPct(startTradePct)}
            </div>
            <div class="col">
              ${formatUSDT(startTrade)}
            </div>
          </div>
        </div>
        <div class="col">
          <div class="row">
            <div class="col">
              ${formatUSDT(yesterdayInUSDT)}
            </div>
          </div>
          <div class="row">
            <div class="col">
              ${formatCoinInUSDT(yesterdayPositionsInUSDT)}
            </div>
            <div class="col">
              ${formatUSDT(yesterdayUSDT)}
            </div>
          </div>
          <div class="row">
            <div class="col">
              ${formatPct(yesterdayTradePct)}
            </div>
            <div class="col">
              ${formatUSDT(yesterdayTrade)}
            </div>
          </div>
        </div>
        <div class="col">
          <div class="row">
            <div class="col">
              ${formatUSDT(todayInUSDT)}
            </div>
          </div>
          <div class="row">
            <div class="col">
              ${formatCoinInUSDT(todayPositionsInUSDT)}
            </div>
            <div class="col">
              ${formatUSDT(todayUSDT)}
            </div>
          </div>
          <div class="row">
            <div class="col">
              ${formatPct(todayTradePct)}
            </div>
            <div class="col">
              ${formatUSDT(todayTrade)}
            </div>
          </div>
        </div>
        <div class="col">
          <div class="row">
            <div class="col">
              ${formatUSDT(inUSDT)}
            </div>
          </div>
            <div class="row">
              <div class="col">
                ${formatCoinInUSDT(positionsInUSDT)}
              </div>
              <div class="col">
                ${formatUSDT(USDT)}
              </div>
            </div>
        </div>
      </div>
  `
    }).join('\n')
    document.getElementById('traders-table').innerHTML = headersRow + dataRows
  }, 30)
}

function formTradersTableData (data) {
  const {sumBy, find, cloneDeepWith} = _
  const {getBalancesAt, getTrade} = bittrexHelpers

  const today = moment().tz('EET').hours(0).minutes(0).seconds(0)
  const yesterday = moment(today).subtract(1, 'day')
  const periodStartDate = moment(today).date(10)

  const {rates} = data

  const table = _(data.balances).keys().map(traderName => {
    const balances = data.balances[traderName]
    const orderHistory = data.orderHistory[traderName]
    const depositHistory = data.depositHistory[traderName]
    const withdrawalHistory = data.withdrawalHistory[traderName]

    const traderData = {balances, orderHistory, depositHistory, withdrawalHistory}

    const startInUSDT = _(getBalancesAt(traderData, periodStartDate))
      .map((balance, currency) => rates[currency] * balance).sum()
    const startUSDT = getBalancesAt(traderData, periodStartDate, 'USDT')
    const startPositionsInUSDT = startInUSDT - startUSDT
    const startTrade = getTrade(orderHistory, {rates, after: periodStartDate})
    const startTradePct = startTrade / startInUSDT

    const yesterdayInUSDT = _(getBalancesAt(traderData, yesterday))
      .map((balance, currency) => rates[currency] * balance).sum()
    const yesterdayUSDT = getBalancesAt(traderData, yesterday, 'USDT')
    const yesterdayPositionsInUSDT = yesterdayInUSDT - yesterdayUSDT
    const yesterdayTrade = getTrade(orderHistory, {rates, after: yesterday})
    const yesterdayTradePct = yesterdayTrade / yesterdayInUSDT

    const todayInUSDT = _(getBalancesAt(traderData, today))
      .map((balance, currency) => rates[currency] * balance).sum()
    const todayUSDT = getBalancesAt(traderData, today, 'USDT')
    const todayPositionsInUSDT = todayInUSDT - todayUSDT
    const todayTrade = getTrade(orderHistory, {rates, after: today})
    const todayTradePct = todayTrade / todayInUSDT

    const USDT = find(balances, {currency: 'USDT'}).balance
    const inUSDT = _(balances)
      .map(({currency, balance}) => balance * rates[currency]).sum()
    const positionsInUSDT = inUSDT - USDT

    return {
      traderName,

      startInUSDT, startUSDT, startPositionsInUSDT,
      startTrade, startTradePct,

      yesterdayInUSDT, yesterdayUSDT, yesterdayPositionsInUSDT,
      yesterdayTrade, yesterdayTradePct,

      todayInUSDT, todayUSDT, todayPositionsInUSDT,
      todayTradePct, todayTrade,

      inUSDT, positionsInUSDT, USDT,
    }
  }).value()

  const totalStartInUSDT = sumBy(table, 'startInUSDT')
  const totalStartTrade = sumBy(table, 'startTrade')
  const totalYesterdayInUSDT = sumBy(table, 'yesterdayInUSDT')
  const totalYesterdayTrade = sumBy(table, 'yesterdayTrade')
  const totalTodayInUSDT = sumBy(table, 'todayInUSDT')
  const totalTodayTrade = sumBy(table, 'todayTrade')

  table.push({
    traderName: 'total',

    startInUSDT: totalStartInUSDT,
    startUSDT: sumBy(table, 'startUSDT'),
    startPositionsInUSDT: sumBy(table, 'startPositionsInUSDT'),
    startTrade: totalStartTrade,
    startTradePct: totalStartTrade / totalStartInUSDT,

    yesterdayInUSDT: totalYesterdayInUSDT,
    yesterdayUSDT: sumBy(table, 'yesterdayUSDT'),
    yesterdayPositionsInUSDT: sumBy(table, 'yesterdayPositionsInUSDT'),
    yesterdayTrade: totalYesterdayTrade,
    yesterdayTradePct: totalYesterdayTrade / totalYesterdayInUSDT,

    todayInUSDT: totalTodayInUSDT,
    todayUSDT: sumBy(table, 'todayUSDT'),
    todayPositionsInUSDT: sumBy(table, 'todayPositionsInUSDT'),
    todayTrade: totalTodayTrade,
    todayTradePct: totalTodayTrade / totalTodayInUSDT,

    inUSDT: sumBy(table, 'inUSDT'),
    positionsInUSDT: sumBy(table, 'positionsInUSDT'),
    USDT: sumBy(table, 'USDT'),
  })

  return cloneDeepWith(table, v => {
    if (Number.isNaN(v)) return 0
    if (v == Infinity || v == -Infinity) return 'up'
  })
}