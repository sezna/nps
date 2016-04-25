#!/usr/bin/env node
/* eslint-disable */ // this file is not transpiled (maybe it should be?) so make sure it supports Node 0.10.0

var findUp = require('find-up')
var isEmpty = require('lodash.isempty')
var merge = require('lodash.merge')
var remove = require('lodash.remove')
var contains = require('lodash.contains')
var shellEscape = require('shell-escape')
var runPackageScript = require('../dist').default
var program = require('commander')

program
  .version(require('../package.json').version)
  .allowUnknownOption()
  .option('-s, --silent', 'Silent p-s output')
  .option('-p, --parallel <script-name1,script-name2>', 'Scripts to run in parallel (comma seprated)')
  .option('-c, --config <filepath>', 'Config file to use (defaults to nearest package-scripts.js)')
  .parse(process.argv)

var scriptsAndArgs = getScriptsAndArgs()

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

function getScriptsAndArgs() {
  var scripts, args, parallel
  if (!isEmpty(program.parallel)) {
    scripts = program.parallel.split(',')
    args = getArgs(program.args, program.rawArgs)
    parallel = true
  } else {
    scripts = program.args[0].split(',')
    args = getArgs(program.args.slice(1), program.rawArgs)
    parallel = false
  }
  return {scripts: scripts, args: args, parallel: parallel}
}

function getArgs(args, rawArgs) {
  var allArgs = rawArgs.slice(2)
  var psArgs = ['-p', '--parallel', '-c', '--config']
  var psFlags = ['-s', '--silent']
  var cleanedArgs = remove(allArgs, function(item, index, arry) {
    if (contains(psArgs, item) || contains(psFlags, item)) {
      return false
    } else if (contains(psArgs, arry[index - 1])) {
      return false
    }
    return true
  })
  return shellEscape(cleanedArgs)
}
