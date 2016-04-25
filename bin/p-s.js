#!/usr/bin/env node
/* eslint-disable */ // this file is not transpiled (maybe it should be?) so make sure it supports Node 0.10.0

var findUp = require('find-up')
var isEmpty = require('lodash.isempty')
var merge = require('lodash.merge')
var runPackageScript = require('../dist').default
var program = require('commander')

program
  .version(require('../package.json').version)
  .option('-s, --silent', 'Silent p-s output')
  .option('-p, --parallel <script-name1,script-name2>', 'Scripts to run in parallel (comma seprated)')
  .option('-c, --config <filepath>', 'Config file to use (defaults to nearest package-scripts.js)')
  .parse(process.argv)

var psConfigFilename = program.config || findUp.sync('package-scripts.js')
var psConfig = require(psConfigFilename)
merge(psConfig.options, {
  silent: program.silent
})
var scriptsAndArgs = getScriptsAndArgs()

runPackageScript(psConfig, scriptsAndArgs.scripts, scriptsAndArgs.args, function(result) {
  if (result.error) {
    throw result.error
  }
  process.exit(result.code)
})

function getScriptsAndArgs() {
  var scripts, args
  if (!isEmpty(program.parallel)) {
    scripts = program.parallel.split(',')
    args = program.args.join(' ')
  } else {
    scripts = [program.args[0]]
    args = program.args.slice(1).join(' ')
  }
  return {scripts: scripts, args: args}
}
