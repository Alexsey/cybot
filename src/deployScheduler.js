'use strict'

const _ = require('lodash')
const moment = require('moment')
const shell = require('shelljs')

const day = 24 * 60 * 60 * 1000

const [hours, minutes, seconds] = process.argv[2].split(':')
let time = new Date().setHours(hours, minutes || 0, seconds || 0, 0)
if (time <= Date.now()) time += day

const gitStatus = shell.exec('git status')
if (!gitStatus.stdout.includes('nothing to commit, working tree clean')) {
  shell.exec('git commit -am "auto commit" && git pull --rebase && git push')
}

console.log(`\nWill deploy in ${moment.duration(time - Date.now()).humanize()}`)

setTimeout(() => {
  shell.exec('git pull --rebase && npm run deploy')
}, time - Date.now())