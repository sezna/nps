#!/usr/bin/env node
/* eslint-disable */ // this file is not transpiled (maybe it should be?) so make sure it supports Node 0.10.0

var findUp = require('find-up')
var isEmpty = require('lodash.isempty')
var merge = require('lodash.merge')
var remove = require('lodash.remove')
var contains = require('lodash.contains')
var shellEscape = require('shell-escape')
var runPackageScript = require('../dist').default
var getScriptsAndArgs = require('../dist/bin-utils').getScriptsAndArgs
var program = require('commander')

program
  .version(require('../package.json').version)
  .allowUnknownOption()
  .option('-s, --silent', 'Silent p-s output')
  .option('-p, --parallel <script-name1,script-name2>', 'Scripts to run in parallel (comma seprated)')
  .option('-c, --config <filepath>', 'Config file to use (defaults to nearest package-scripts.js)')
  .parse(process.argv)

var scriptsAndArgs = getScriptsAndArgs(program)

var psConfigFilename = program.config || findUp.sync('package-scripts.js')
var psConfig = require(psConfigFilename)
merge(psConfig.options, {
  silent: program.silent
})

runPackageScript({
  scriptConfig: psConfig.scripts,
  scripts: scriptsAndArgs.scripts,
  args: scriptsAndArgs.args,
  options: merge(psConfig.options, {
    silent: program.silent,
    parallel: scriptsAndArgs.parallel,
  })
}, function(result) {
  if (result.error) {
    throw result.error
  }
  process.exit(result.code)
})
