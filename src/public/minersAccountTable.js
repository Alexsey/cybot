'use strict'

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