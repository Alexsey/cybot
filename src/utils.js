'use strict'

const _ = require('lodash')
const {dropWhile, now} = _

exports.getThrottle = (lim = 1, time = 1000) => {
  let q = []

  return f => async (...args) => {
    q = dropWhile(q, v => v < now() - time)
    if (q.length < lim) {
      q.push(now())
      return f(...args)
    }
    const next = q[q.length - lim] + time
    q.push(next)
    await new Promise(r => setTimeout(r, next - now()))
    return f(...args)
  }
}

exports.objToCsv = obj =>
  _(obj)
    .toPairs()
    .unzip()
    .invokeMap('join', ';')
    .join('\n')

exports.csvToObj = csv =>
  _(csv)
    .split('\n')
    .invokeMap('split', ';')
    .unzip()
    .fromPairs()
    .value()

exports.getNonce = () => {
  const last = [now() / 1000 | 0, 0]
  return () => {
    const now_ = now() / 1000 | 0
    if (last[0] == now_) {
      last[1]++
    } else {
      last[0] = now_
      last[1] = 0
    }
    return last[0] + `${last[1]}`.padStart(3, '0')
  }
}