#!/usr/bin/env node
/* eslint no-process-exit: "off" */
import findUp from 'find-up'
import {merge} from 'lodash'
import program from 'commander'
import colors from 'colors/safe'
import runPackageScript from '../index'
import {getScriptsAndArgs, initialize, help, preloadModule, loadConfig} from '../bin-utils'
import getLogger from '../get-logger'

const log = getLogger()
const FAIL_CODE = 1
let initializing = false

program
  .version(require('../../package.json').version)
  .allowUnknownOption()
  .option('-s, --silent', 'Silent p-s output')
  .option('-p, --parallel <script-name1,script-name2>', 'Scripts to run in parallel (comma seprated)')
  .option('-c, --config <filepath>', 'Config file to use (defaults to nearest package-scripts.js)')
  .option('-l, --log-level <level>', 'The log level to use (error, warn, info [default])')
  .option('-r, --require <module>', 'Module to preload')
  .on('init', () => {
    initializing = true
    const {packageScriptsPath} = initialize()
    log.info(`Your scripts have been saved at ${colors.green(packageScriptsPath)}`)
    log.info(colors.gray(
      'Check out your scripts in there. Go ahead and update them and add descriptions to the ones that need it'
    ))
    log.info(colors.gray('Your package.json scripts have also been updated. Run `npm start --help` for help'))
  })
  .on('--help', onHelp)
  .parse(process.argv)

if (!initializing) {
  const scriptsAndArgs = getScriptsAndArgs(program)
  if (scriptsAndArgs.scripts.length < 1) {
    program.outputHelp()
  } else {
    loadAndRun(scriptsAndArgs)
  }
}

function loadAndRun(scriptsAndArgs) {
  const psConfig = getPSConfig()

  runPackageScript({
    scriptConfig: psConfig.scripts,
    scripts: scriptsAndArgs.scripts,
    args: scriptsAndArgs.args,
    options: merge(psConfig.options, {
      silent: program.silent,
      parallel: scriptsAndArgs.parallel,
      logLevel: program.logLevel,
    }),
  }, result => {
    if (result.error) {
      log.error(result.error)
      process.exit(FAIL_CODE)
    }
    process.exit(result.code)
  })
}

function getPSConfig() {
  if (program.require) {
    preloadModule(program.require)
  }
  const config = loadConfig(program.config || findUp.sync('package-scripts.js'))
  if (!config) {
    process.exit(FAIL_CODE)
  }
  return config
}

function onHelp() {
  log.info(help(getPSConfig()))
}
