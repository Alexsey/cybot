'use strict'

async function formMinersAccountTableData (minersTableData, minerData, rates) {
  const {getBalancesAt} = bittrexHelpers
  const today = moment().tz('EET').hours(0).minutes(0).seconds(0).milliseconds(0)

  const addToStart = 112000
  const addToToday = config.minersTable.fakeData.BCN.deposit * (await data.getRatesAt(today)).BCN
  const addToCurrent = config.minersTable.fakeData.BCN.deposit * rates.BCN

  const startInUSDT = _.sumBy(minersTableData, 'totalUSDT') + addToStart
  const todayInUSDT = (await getBalancesAt(minerData, today)).total + addToToday
  const inUSDT = (await getBalancesAt(minerData)).total + addToCurrent

  return {startInUSDT, todayInUSDT, inUSDT}
}

function buildMainAccountTable ({startInUSDT, todayInUSDT, inUSDT}) {
  const headersRow = `
    <div class="row row-delimiter">
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

  const startTrade = inUSDT - startInUSDT
  const startTradePct = startTrade / startInUSDT
  const todayTrade = inUSDT - todayInUSDT
  const todayTradePct = todayTrade / todayInUSDT

  const dataRows = `
    <div class="row">
      <div class="col">
          ${formatUSDT(startInUSDT)}
      </div>
      <div class="col">
          ${formatUSDT(todayInUSDT)}
      </div>
      <div class="col">
          ${formatUSDT(inUSDT)}
      </div>
    </div>
    <div class="row row-bottom-delimiter">
      <div class="col">
        <div class="row">
            <div class="col">
                ${formatUSDT(startTrade)}
            </div>
            <div class="col">
                ${formatPct(startTradePct)}
            </div>
        </div>
      </div>
      <div class="col">
        <div class="row">
            <div class="col">&nbsp;</div>
            <div class="col">&nbsp;</div>
        </div>
      </div>
      <div class="col">
        <div class="row">
            <div class="col">
                ${formatUSDT(todayTrade)}
            </div>
            <div class="col">
                ${formatPct(todayTradePct)}
            </div>
        </div>
      </div>
    </div>
  `

  return `
    <div class="table-header">Main Account</div>
    <div><br></div>
    <div class="container">${headersRow}${dataRows}</div>
  `
}

async function buildMainAccountTable_old () {
  const headersRow = `
    <div class="row row-delimiter">
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

  const dataRow = `
    <div class="row row-bottom-delimiter">
      <div class="col">
        <div class="row">
          <div class="col">
            ${formatUSDT(config.mainAccountTable.start)}
          </div>
        </div>
        <div class="row">
          <div class="col">
            ${formatPct(config.mainAccountTable.current / config.mainAccountTable.start - 1)}
          </div>
          <div class="col">
            ${formatUSDT(config.mainAccountTable.current - config.mainAccountTable.start)}
          </div>
        </div>
      </div>
      <div class="col">
        <div class="row">
          <div class="col">
            ${formatUSDT(config.mainAccountTable.yesterday)}
          </div>
        </div>
      </div>
      <div class="col">
        <div class="row">
          <div class="col">
            ${formatUSDT(config.mainAccountTable.current)}
          </div>
        </div>
          <div class="row">
          <div class="col">
            ${formatPct(config.mainAccountTable.current / config.mainAccountTable.yesterday - 1)}
          </div>
          <div class="col">
            ${formatUSDT(config.mainAccountTable.current - config.mainAccountTable.yesterday)}
          </div>
        </div>
      </div>
    </div>
  `

  document.getElementById('main-account-table').innerHTML = `
    <div class="table-header">Main Account</div>
    <div><br></div>
    <div class="container">${headersRow}${dataRow}</div>
  `
}