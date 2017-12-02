'use strict'

const _ = require('lodash')
const moment = require('moment')
const shell = require('shelljs')

const [hours, minutes, seconds] = process.argv[2].split(':')
const time = moment().hours(hours).minutes(minutes || 0).seconds(seconds || 0).millisecond(0)

if (time.isBefore(Date.now())) time.add(1, 'day')

const gitStatus = shell.exec('git status')
if (!gitStatus.stdout.includes('nothing to commit, working tree clean')) {
  shell.exec('git commit -am "auto commit" && git pull --rebase && git push')
}

console.log(`will deploy in ${moment.duration(time - Date.now()).humanize()}`)

setTimeout(() => {
  shell.exec('git pull --rebase && npm run deploy')
}, time - Date.now())