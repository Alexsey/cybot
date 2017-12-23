'use strict'

function buildTradersTable (rows) {
  // Yesterday column is containing today's data. Actually it is a
  // 00:00 of today, but in UI it is easier to ready as "Yesterday"
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
          Current
      </div>
    </div>
  `
  const dataRows = rows.map(({
      traderName,

      startInUSDT, startUSDT, startPositionsInUSDT,
      startTrade, startTradePct,

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
          ${startPositionsInUSDT != null && startUSDT != null
            ? `
              <div class="row">
                  <div class="col">
                      ${formatCoinInUSDT(startPositionsInUSDT)}
                  </div>
                <div class="col">
                  ${formatUSDT(startUSDT)}
                </div>
              </div>
            `
            : ''
          }
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
            <div class="row">
            <div class="col">
              ${formatPct(todayTradePct)}
            </div>
            <div class="col">
              ${formatUSDT(todayTrade)}
            </div>
          </div>
        </div>
      </div>
    `
  }).join('\n')
  return `
    <div class="table-header">Traders Table</div>
    <div><br></div>
    <div class="container">${headersRow}${dataRows}</div>
  `
}

function formTradersTableData (data, rates) {
  const {sumBy, floor} = _
  const {getBalancesAt, getTrade} = bittrexHelpers

  const today = moment().tz('EET').hours(0).minutes(0).seconds(0)
  const periodStartDate = today.date() >= config.periodStartDate
    ? moment(today).date(config.periodStartDate)
    : moment(today).subtract(1, 'month').date(config.periodStartDate)

  const hour = 60 * 60 * 1000
  const currentTimePeriod = config.tradersTable.currentTimePeriod * hour
  // if config.tradersTable.currentTimePeriod == 0 than currentTime is actually current
  const currentTime = floor(Date.now() / currentTimePeriod) * currentTimePeriod || Date.now()

  const table = data.getNames('traders').map(traderName => {
    const traderData = data.getData('trader', traderName)
    const {orderHistory} = traderData

    const todayInUSDT = getBalancesAt(traderData, today).total
    const todayUSDT = getBalancesAt(traderData, today, 'USDT')
    const todayPositionsInUSDT = todayInUSDT - todayUSDT
    const todayTrade = getTrade(orderHistory, {rates, after: today, before: currentTime})
    const todayTradePct = todayTrade / todayInUSDT

    const USDT = getBalancesAt(traderData, currentTime, 'USDT')
    const inUSDT = getBalancesAt(traderData, currentTime).total
    const positionsInUSDT = inUSDT - USDT

    let startInUSDT, startUSDT, startPositionsInUSDT ,startTrade
    if (config.tradersTable.useFakeData && config.tradersTable.fakeData[traderName]) {
      startInUSDT = config.tradersTable.fakeData[traderName].startInUSDT
      startTrade = inUSDT - startInUSDT
    } else {
      startInUSDT = getBalancesAt(traderData, periodStartDate).total
      startUSDT = getBalancesAt(traderData, periodStartDate, 'USDT')
      startPositionsInUSDT = startInUSDT - startUSDT
      startTrade = getTrade(orderHistory, {rates, after: periodStartDate})
    }
    const startTradePct = startTrade / startInUSDT

    return {
      traderName,

      startInUSDT, startUSDT, startPositionsInUSDT,
      startTrade, startTradePct,

      todayInUSDT, todayUSDT, todayPositionsInUSDT,
      todayTradePct, todayTrade,

      inUSDT, positionsInUSDT, USDT,
    }
  })

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

  return table
}