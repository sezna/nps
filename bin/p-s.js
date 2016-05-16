#!/usr/bin/env node
/* eslint-disable */ // this file is not transpiled (maybe it should be?) so make sure it supports Node 0.10.0

var resolve = require('path').resolve
var findUp = require('find-up')
var isEmpty = require('lodash.isempty')
var merge = require('lodash.merge')
var remove = require('lodash.remove')
var contains = require('lodash.contains')
var shellEscape = require('shell-escape')
var program = require('commander')
var colors = require('colors/safe')

var runPackageScript = require('../dist').default
var binUtils = require('../dist/bin-utils')
var log = require('../dist/get-logger').default()
var getScriptsAndArgs = binUtils.getScriptsAndArgs

program
  .version(require('../package.json').version)
  .allowUnknownOption()
  .option('-s, --silent', 'Silent p-s output')
  .option('-p, --parallel <script-name1,script-name2>', 'Scripts to run in parallel (comma seprated)')
  .option('-c, --config <filepath>', 'Config file to use (defaults to nearest package-scripts.js)')
  .option('-l, --log-level <level>', 'The log level to use (error, warn, info [default])')
  .on('--help', onHelp)
  .parse(process.argv)

if (process.argv.length < 3) {
  program.outputHelp()
  return
}

var scriptsAndArgs = getScriptsAndArgs(program)
var psConfig = getPSConfig()

runPackageScript({
  scriptConfig: getPSConfig().scripts,
  scripts: scriptsAndArgs.scripts,
  args: scriptsAndArgs.args,
  options: merge(psConfig.options, {
    silent: program.silent,
    parallel: scriptsAndArgs.parallel,
    logLevel: program.logLevel,
  })
}, function(result) {
  if (result.error) {
    log.error(result.error)
    const FAIL_CODE = 1
    process.exit(FAIL_CODE)
  }
  process.exit(result.code)
})

function getPSConfig() {
  var psConfigFilename = program.config ? resolve(process.cwd(), program.config) : findUp.sync('package-scripts.js')
  try {
    return require(psConfigFilename)
  } catch(e) {
    log.warn({
      message: colors.yellow('Unable to find config at ' + psConfigFilename),
      ref: 'unable-to-find-config'
    })
    return {scripts: {}, options: {}}
  }
}

function onHelp() {
  log.info(binUtils.help(getPSConfig()))
}
