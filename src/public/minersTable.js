'use strict'

async function updateMinersTable () {
  const {keys, sumBy} = _
  document.getElementById('miners-table').innerHTML = ''

  loader.buildingTable()
  await new Promise(fulfill => setTimeout(fulfill, 30)) // hack to loader.buildingTable() to execute

  const minerName = keys(data.miners.depositHistory)[0]
  const depositHistory = data.miners.depositHistory[minerName]
  const withdrawalHistory = data.miners.withdrawalHistory[minerName]
  const rowsData = config.useFakeMiners
    ? formMinersTableDataFake(data.rates)
    : formMinersTableData(depositHistory, withdrawalHistory, data.rates)

  const headersRow = `
    <div class="row row-delimiter">
      <div class="col-sm-1">
          Currency
      </div>
      <div class="col">
          Deposits
      </div>
      <div class="col">
          Withdrawals
      </div>
      <div class="col">
          Total
      </div>
    </div>
  `
  const currencyRows = rowsData.map(({
    currency, deposit, depositUSDT, withdrawal, withdrawalUSDT, total, totalUSDT
  }) => `
    <div class="row row-bottom-delimiter">
      <div class="col-sm-1 multiline-col">
        <div>
          ${currency}
        </div>
      </div>
      <div class="col">
        <div class="row">
          <div class="col">
            ${formatCoin(deposit)}
          </div>
          <div class="col">
            ${formatUSDT(depositUSDT)}
          </div>
        </div>
      </div>
      <div class="col">
        <div class="row">
          <div class="col">
            ${formatCoin(withdrawal)}
          </div>
          <div class="col">
            ${formatUSDT(withdrawalUSDT)}
          </div>
        </div>
      </div>
      <div class="col">
        <div class="row">
          <div class="col">
            ${formatCoin(total)}
          </div>
          <div class="col">
            ${formatUSDT(totalUSDT)}
          </div>
        </div>
      </div>
    </div>
  `).join('\n')

  const totalsRow = `
    <div class="row row-bottom-delimiter">
      <div class="col-sm-1">
          Total
      </div>
      <div class="col">
          ${formatUSDT(sumBy(rowsData, 'depositUSDT'))}
      </div>
      <div class="col">
          ${formatUSDT(sumBy(rowsData, 'withdrawalUSDT'))}
      </div>
      <div class="col">
          ${formatUSDT(sumBy(rowsData, 'totalUSDT'))}
      </div>
    </div>
  `

  document.getElementById('miners-table').innerHTML = `
    <div class="table-header">Miners Table</div>
    <div><br></div>
    <div class="container">${headersRow}${currencyRows}${totalsRow}</div>
  `

  loader.disable()
}

function formMinersTableData (deposits, withdrawals, rates) {
  const {getDeposit, getWithdrawal, getIO} = bittrexHelpers
  return config.miningCurrencies.map(currency => {
    const deposit = getDeposit(deposits, {currency})
    const depositUSDT = rates[currency] * deposit
    const withdrawal = getWithdrawal(withdrawals, {currency})
    const withdrawalUSDT = rates[currency] * withdrawal
    const total = getIO(deposits, withdrawals, {currency})
    const totalUSDT = rates[currency] * total
    return {
      currency,
      deposit,
      depositUSDT,
      withdrawal,
      withdrawalUSDT,
      total,
      totalUSDT
    }
  })
}

function formMinersTableDataFake (rates) {
  return _.map(config.fakeMiningTable, ({deposit, withdrawal}, currency) => {
    const depositUSDT = rates[currency] * deposit
    const withdrawalUSDT = rates[currency] * withdrawal
    const total = deposit - (1 + config.bittrexCommission) * withdrawal
    const totalUSDT = rates[currency] * total
    return {
      currency,
      deposit,
      depositUSDT,
      withdrawal,
      withdrawalUSDT,
      total,
      totalUSDT
    }
  })

}