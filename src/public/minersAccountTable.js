'use strict'

function formMinersAccountTableData (minersTableData, minerData, rates) {
  const {getBalancesAt} = bittrexHelpers
  const today = moment().tz('EET').hours(0).minutes(0).seconds(0)

  const addToStart = 10000
  const reduceBTC = 3.45643030
  const reduceBy = reduceBTC * rates.BTC

  const total = _.sumBy(minersTableData, 'totalUSDT') + addToStart
  const yesterday = getBalancesAt(minerData, today).total - reduceBy
  const current = getBalancesAt(minerData).total - reduceBy

  return {total, yesterday, current}
}


function buildMainersAccountTable (rowsData) {
  const headersRow = `
    <div class="row row-delimiter">
      <div class="col">
          Start
      </div>
      <div class="col">
          Current
      </div>
    </div>
  `

  const dataRow = `
    <div class="row row-bottom-delimiter">
      <div class="col">
          ${formatUSDT(_.sumBy(rowsData, 'totalUSDT'))}
      </div>
      <div class="col">
          ${formatUSDT(config.minersAccountTable.total)}
      </div>
    </div>
  `

  return `
    <div class="table-header">Miners Account</div>
    <div><br></div>
    <div class="container">${headersRow}${dataRow}</div>
  `
}