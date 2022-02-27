#!/usr/bin/env node

import {merge} from 'lodash'
import getLogger, {getLogLevel} from '../get-logger'
import runPackageScript from '../index'
import parse from '../bin-utils/parser'

const FAIL_CODE = 1

const args = process.argv.slice(2)
const indexOfCommand = args.findIndex(arg => !arg.startsWith('-'))
const preCommandFlags = args.slice(0, indexOfCommand + 1)
const postCommandFlags = args.slice(indexOfCommand + 1)

const {argv, psConfig} = parse(preCommandFlags) || {}

if (argv && psConfig) {
  runPackageScript({
    scriptConfig: psConfig.scripts,
    scripts: argv._,
    options: merge(
      {
        silent: argv.silent,
        logLevel: argv.logLevel,
        prefix: argv.prefix,
        scripts: argv.scripts,
        args: postCommandFlags,
      },
      psConfig.options,
    ),
  }).then(
    () => {
      // make this explicit
      // because sometimes we can't explain
      // everything about life that confuses us...
      process.exitCode = 0
    },
    error => {
      const logLevel = getLogLevel(
        merge(
          {
            silent: argv.silent,
            logLevel: argv.logLevel,
            scripts: argv.scripts,
          },
          psConfig.options,
        ),
      )
      const log = getLogger(logLevel)
      log.error(error)
      process.exitCode = error.code || FAIL_CODE
    },
  )
}
