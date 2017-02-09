#!/usr/bin/env node
/* eslint no-process-exit: "off" */
import findUp from 'find-up'
import {merge, includes, indexOf} from 'lodash'
import program from 'commander'
import colors from 'colors/safe'
import {keyInYN} from 'readline-sync'
import runPackageScript from '../index'
import {
  getScriptsAndArgs, initialize, autocomplete, installAutocomplete,
  help, preloadModule, loadConfig,
} from '../bin-utils'
import getLogger from '../get-logger'

const {version} = require('../../package.json')

const log = getLogger()
const FAIL_CODE = 1
let shouldRun = true
const shouldAutocomplete = includes(process.argv, '--compbash')

program
  .version(version)
  .allowUnknownOption()
  .option('-s, --silent', 'Silent nps output')
  .option('-p, --parallel <script-name1,script-name2>', 'Scripts to run in parallel (comma seprated)')
  .option('-c, --config <filepath>', 'Config file to use (defaults to nearest package-scripts.yml or package-scripts.js)')
  .option('-l, --log-level <level>', 'The log level to use (error, warn, info [default])')
  .option('-r, --require <module>', 'Module to preload')
  .on('init', onInit)
  .on('completion', onRequestToInstallCompletion)
  .on('--help', onHelp)
  .parse(process.argv)

const scriptsAndArgs = getScriptsAndArgs(program)

if (shouldAutocomplete) {
  autocomplete(getPSConfig())
} else if (shouldRun) {
  const psConfig = getPSConfig()
  const hasDefaultScript = !!psConfig.scripts.default
  const hasHelpScript = !!psConfig.scripts.help
  const scriptIsHelp = scriptsAndArgs.scripts[0] === 'help'
  const scriptSpecified = scriptsAndArgs.scripts.length >= 1
  if (!hasDefaultScript && !scriptSpecified) {
    program.outputHelp()
  } else if (!hasHelpScript && scriptIsHelp) { // eslint-disable-line no-negated-condition
    program.outputHelp()
  } else {
    loadAndRun(psConfig)
  }
}

function loadAndRun(psConfig) {
  runPackageScript({
    scriptConfig: psConfig.scripts,
    scripts: scriptsAndArgs.scripts,
    args: scriptsAndArgs.args,
    options: merge(psConfig.options, {
      silent: program.silent,
      parallel: scriptsAndArgs.parallel,
      logLevel: program.logLevel,
    }),
  }).catch(error => {
    log.error(error)
    process.exitCode = error.code || FAIL_CODE
  })
}

function getPSConfig() {
  if (program.require) {
    preloadModule(program.require)
  }
  const configFilepath = getPSConfigFilepath()
  if (!configFilepath) {
    log.warn(colors.yellow('Unable to find a config file and none was specified.'))
    return {scripts: {}} // empty config
  }
  const config = loadConfig(configFilepath, scriptsAndArgs)
  if (!config) {
    process.exit(FAIL_CODE)
  }
  return config
}

function getPSConfigFilepath() {
  return program.config || findUp.sync('package-scripts.js') || findUp.sync('package-scripts.yml')
}

function onInit() {
  if (getPSConfigFilepath()) {
    if (!keyInYN(colors.yellow(`Do you want to overwrite your existing config file?`))) {
      process.exit(FAIL_CODE)
    }
  }
  shouldRun = false
  const {packageScriptsPath} = initialize(getConfigType())
  log.info(`Your scripts have been saved at ${colors.green(packageScriptsPath)}`)
  log.info(colors.gray(
    'Check out your scripts in there. Go ahead and update them and add descriptions to the ones that need it',
  ))
  log.info(colors.gray('Your package.json scripts have also been updated. Run `npm start help` for help'))
  log.info(colors.gray(
    'You may also want to install the package globally and installing autocomplete script. You can do so by running\n' +
    '  npm install --global p-s\n' +
    '  nps completion <optionally-your-bash-profile-file>\n' +
    'The bash profile file defaults to ~/.bash_profile for bash and ~/.zshrc for zsh',
  ))
}

function getConfigType() {
  return includes(process.argv, '--type') ? process.argv[indexOf(process.argv, '--type') + 1] : 'js'
}

function onHelp() {
  shouldRun = false
  log.info(help(getPSConfig()))
}

function onRequestToInstallCompletion() {
  shouldRun = false
  const [,,, destination] = process.argv
  if (destination) {
    log.info(`Installing p-s autocomplete into ${destination}`)
  } else {
    log.info('Installing p-s autocomplete into the default for your current terminal')
  }
  log.info(
    `You're going to need to either resource that file, or open a new instance of ` +
    'the terminal to get autocomplete to start working',
  )
  installAutocomplete(destination)
}
