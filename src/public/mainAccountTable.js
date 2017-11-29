'use strict'

async function updateMainAccountTable () {
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