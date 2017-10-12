'use strict'

function updateOrdersTable (traderName, currency) {
  document.getElementById('orders-table').innerHTML = `
    <div class="loader"></div>
  `

  setTimeout(() => { // hack to wrapper.display = 'none' to execute in time
    const pairs = formOrdersTableData(data, traderName, currency)

    document.getElementById('orders-table').innerHTML = _.flatMap(pairs, ({
      currencySecond, orders, avgMainBuy, avgMainSell, avgSecondBuy, avgSecondSell
    }) => {
      const currentRate = data.marketSummaries.find(m =>
        m.marketName.includes(currency)
        && m.marketName.includes(currencySecond)
      ) || {marketName: `${currency}-${currencySecond}`, last: 0}
      const [mainToSecondRate, secondToMainRate] = currentRate.marketName.startsWith(currency)
        ? [currentRate.last, 1 / currentRate.last]
        : [1 / currentRate.last, currentRate.last]

      const pairRow = `
      <div class="row row-delimiter">
        <div class="col">
          ${currency}-${currencySecond}: ${formatFloat(secondToMainRate)} / ${formatFloat(mainToSecondRate)}
        </div>
        <div class="col">
          Today avg${currency}Buy: ${formatAvg(avgMainBuy)}
        </div>
        <div class="col">
          Today avg${currency}Sell: ${formatAvg(avgMainSell)}
        </div>
        <div class="col">
          Today avg${currencySecond}Buy: ${formatAvg(avgSecondBuy)}
        </div>
        <div class="col">
          Today avg${currencySecond}Sell: ${formatAvg(avgSecondSell)}
        </div>
      </div>
      `

      const headersRow = `
        <div class="row row-bottom-delimiter">
          <div class="col">
            Opened
          </div>
          <div class="col">
            Closed
          </div>
          <div class="col">
            ${currency}
          </div>
          <div class="col-sm-1">
            Side
          </div>
          <div class="col">
            ${currencySecond}
          </div>
          <div class="col">
            ${currency}/${currencySecond}
          </div>
          <div class="col">
            ${currencySecond}/${currency}
          </div>
        </div>
      `

      const ordersRows = orders.map(({
        opened, closed, amountMain, operation, amountSecond, ppuMain, ppuSecond
      }) => `
        <div class="row">
          <div class="col">
            ${formatDatetime(opened)}
          </div>
          <div class="col">
            ${formatDatetime(closed)}
          </div>
          <div class="col">
            ${formatFloatInt(amountMain)}
          </div>
          <div class="col-sm-1">
            ${formatOperation(operation)}
          </div>
          <div class="col">
            ${formatFloatInt(amountSecond)}
          </div>
          <div class="col">
            ${formatFloatInt(ppuMain)}
          </div>
          <div class="col">
            ${formatFloatInt(ppuSecond)}
          </div>
        </div>      
      `).join('\n')

      return pairRow + headersRow + ordersRows
    }).join('\n')
  }, 30)
}

function formOrdersTableData (data, traderName, currency) {
  const today = moment().tz('EET').hours(0).minutes(0).seconds(0)
  const yesterday = moment(today).subtract(1, 'day')

  return _(data.orderHistory[traderName])
    .filter(o => moment(o.timeStamp).isAfter(yesterday))
    .filter(o => o.exchange.includes(currency))
    .map(o => {
      const {
        timeStamp, exchange, orderType, price,
        quantity, quantityRemaining, pricePerUnit
      } = o
      const operation
        = exchange.startsWith(currency) && orderType.match(/buy/i)
      || exchange.endsWith(currency) && orderType.match(/sell/i)
        ? 'sell'
        : 'buy'
      const [amountMain, amountSecond, ppuMain, ppuSecond] = exchange.startsWith(currency)
        ? [price, quantity - quantityRemaining, 1 / pricePerUnit, pricePerUnit]
        : [quantity - quantityRemaining, price, pricePerUnit, 1 / pricePerUnit]
      const [curA, curB] = exchange.split('-')
      const currencySecond = curA == currency ? curB : curA
      return Object.assign(o, {
        opened: timeStamp, operation, amountMain,
        amountSecond, ppuMain, ppuSecond, currencySecond
      })
    })
    .groupBy('currencySecond')
    .toPairs()
    .orderBy(0)
    .map(([currencySecond, os]) => {
      let totalMainBuy = 0
      let totalMainSell = 0
      let totalSecondBuy = 0
      let totalSecondSell = 0

      os
        .filter(({opened}) => moment(opened).isAfter(today))
        .forEach(({operation, amountMain, amountSecond}) => {
        if (operation == 'buy') {
          totalMainBuy += amountMain
          totalSecondSell += amountSecond
        } else {
          totalMainSell += amountMain
          totalSecondBuy += amountSecond
        }
      })

      return {
        currencySecond, orders: os,
        avgMainBuy: totalSecondSell / totalMainBuy,
        avgMainSell: totalSecondBuy / totalMainSell,
        avgSecondBuy: totalMainSell / totalSecondBuy,
        avgSecondSell: totalMainBuy / totalSecondSell,
        totalMainBuy, totalMainSell,
        totalSecondBuy, totalSecondSell
      }
    })
    .value()
}

function hideOrdersTable () {
  document.getElementById('orders-table').innerHTML = ``
}