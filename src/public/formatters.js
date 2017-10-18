'use strict'

const {round, reduceRight} = _

function formatUSDT (val) {
  let [int, dec] = round(val, 3).toFixed(2).split('.')
  return Math.abs(+int) >= 100 || !dec
    ? `$ ${formatBigNumber(int)}`
    : `$ ${int}.${dec}`
}

function formatFloat (val) {
  let [int, decimal] = round(val, 17).toFixed(16).split('.')
  decimal = decimal.replace(/0*$/, '')
  if (int.length > 9) return formatBigNumber(int.slice(0, 8)) + 'e' + (int.length - 8)
  if ((int == '0' || int == '-0') && decimal) {
    let leadingZeros = decimal.match(/^0*/)
    leadingZeros = leadingZeros && leadingZeros[0]
    const leadingZerosLength = leadingZeros && leadingZeros.length
    if (leadingZerosLength > 7) {
      const decimalMeaningful = decimal.slice(leadingZerosLength)
      return decimalMeaningful.length > 1
        ? `${decimalMeaningful[0]}.${decimalMeaningful.slice(1, 8)}e-${leadingZerosLength + 1}`
        : `${decimalMeaningful}e-${leadingZerosLength}`
    } else {
      return `0.${decimal.slice(0, 9)}`
    }
  }
  const decimalToShow = decimal.slice(0, Math.max(0, 8 - int.length)).replace(/0*$/, '')
  return decimalToShow && decimalToShow.match(/[^0]/)
    ? formatBigNumber(int) + '.' + decimalToShow
    : formatBigNumber(int)
}

function formatFloatInt (val) {
  const [int, decimal] = String(val).split('.')
  return formatBigNumber(int) + (decimal ? '.' + decimal : '')
}

function formatCoin (val) {
  return 'Θ ' + formatFloat(val)
}

function formatCoinInUSDT (val) {
  return `Θ${formatUSDT(val).slice(1)}`
}

function formatPct (val) {
  return val == 'up' ? val : `% ${round(val * 100, 2)}`
}

// 12345678 => 12 345 678
function formatBigNumber (val) {
  return val[0] == '-'
    ? '-' + val.slice(1).match(/(.+?(?=(.{3})*$))/g).join(' ')
    : val.match(/(.+?(?=(.{3})*$))/g).join(' ')
}

function formatDatetime (time) {
  return time ? moment(time).tz('EET').format('D dddd HH:mm:ss') : ''
}

function formatAvg (val) {
  return val && Number.isFinite(val) ? formatFloat(val) : '-'
}

function formatOperation (op) {
  // return op == 'buy' ? '<<<' : `>>>`
  // return op == 'buy' ? `<< ${op}` : `${op} >>`
  // return op == 'buy' ? `← ${op} ←` : `→ ${op} →`
  return op == 'buy' ? `←← ${op}` : `${op} →→`
}