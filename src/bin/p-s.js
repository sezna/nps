#!/usr/bin/env node
import findUp from 'find-up'
import merge from 'lodash.merge'
import program from 'commander'
import runPackageScript from '../index'
import {getScriptsAndArgs, help, preloadModule, loadConfig} from '../bin-utils'
import getLogger from '../get-logger'
const log = getLogger()
const FAIL_CODE = 1

program
  .version(require('../../package.json').version)
  .allowUnknownOption()
  .option('-s, --silent', 'Silent p-s output')
  .option('-p, --parallel <script-name1,script-name2>', 'Scripts to run in parallel (comma seprated)')
  .option('-c, --config <filepath>', 'Config file to use (defaults to nearest package-scripts.js)')
  .option('-l, --log-level <level>', 'The log level to use (error, warn, info [default])')
  .option('-r, --require <module>', 'Module to preload')
  .on('--help', onHelp)
  .parse(process.argv)

if (program.args.length < 1) {
  program.outputHelp()
} else {
  loadAndRun()
}

function loadAndRun() {
  const scriptsAndArgs = getScriptsAndArgs(program)
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
