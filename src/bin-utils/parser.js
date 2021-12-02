import findUp from 'find-up'
import yargs from 'yargs/yargs'
import chalk from 'chalk'
import {keyInYN} from 'readline-sync'
import {includes, isEqual} from 'lodash'
import {oneLine} from 'common-tags'
import getLogger from '../get-logger'
import {
  preloadModule,
  loadConfig,
  loadCLIConfig,
  initialize,
  help,
  specificHelpScript,
} from '../bin-utils'
import getCompletionScripts from './autocomplete-get-scripts'
import getScriptByPrefix from './get-script-by-prefix'

const log = getLogger()
export default parse

function parse(rawArgv) {
  let commandExecuted = false

  const configOption = {
    describe: oneLine`
      Config file to use (defaults to nearest package-scripts.yml
      or package-scripts.js)
    `,
    alias: 'c',
    default: getPSConfigFilepath(),
  }

  const baseOptions = {
    config: configOption,
    silent: {
      describe: 'Silent nps output',
      alias: 's',
      type: 'boolean',
      default: false,
    },
    'log-level': {
      describe: 'The log level to use',
      choices: ['error', 'warn', 'info', 'debug'],
      alias: 'l',
      default: 'info',
    },
    prefix: {
      describe: 'Prefix for each script name',
      alias: 'p',
      default: undefined,
    },
    require: {
      describe: 'Module to preload',
      alias: 'r',
      default: undefined,
    },
    scripts: {
      describe: 'Log command text for script',
      type: 'boolean',
      default: true,
    },
    'help-style': {
      describe: 'Choose the level of detail displayed by the help command',
      choices: ['all', 'scripts', 'basic'],
      alias: 'y',
      default: 'all',
    },
  }

  const yargsInstance = yargs(rawArgv)

  const parser = yargsInstance
    .config(getCLIConfig())
    .usage('Usage: $0 [options] <script>...')
    .example('$0 test build', 'Runs the `test` script then the `build` script')
    .example(
      '$0 "test --cover" "build --prod"',
      oneLine`
        Runs the \`test\` script and forwards the "--cover" flag
        then the \`build\` script and forwards the "--prod" flag
      `,
    )
    .help(false)
    .alias('h', 'help')
    .version()
    .alias('v', 'version')
    .options(baseOptions)
    .command(...getInitCommand())
    .completion('completion', completionHandler)
    .exitProcess(shouldExitProcess())

  const parsedArgv = parser.parse(rawArgv)

  if (commandExecuted) {
    return undefined
  }

  const invalidFlags = getInvalidFlags()
  if (invalidFlags.length) {
    log.error({
      message: chalk.red(
        oneLine`
          You provided one or more invalid flags:
          ${invalidFlags.join(', ')}\n
          Did you forget to put your command in quotes?
        `,
      ),
      ref: 'invalid-flags',
    })
    throw new Error(`invalid flag(s) passed: ${invalidFlags}`)
  }

  const psConfig = getPSConfig(parsedArgv)

  if (!psConfig) {
    return undefined
  }

  if (showHelp(parsedArgv._)) {
    return undefined
  }

  return {argv: parsedArgv, psConfig}

  // util functions

  // eslint-disable-next-line complexity
  function showHelp(specifiedScripts) {
    if (parsedArgv.help) {
      // if --help was specified, then yargs will show the default help
      log.info(help(psConfig))
      return true
    }
    const helpStyle = String(psConfig.options['help-style'])
    const hasDefaultScript = parsedArgv.prefix ?
      Boolean(getScriptByPrefix(psConfig, parsedArgv.prefix)) :
      Boolean(psConfig.scripts.default)
    const noScriptSpecifiedAndNoDefault =
      !specifiedScripts.length && !hasDefaultScript
    const hasHelpScript = Boolean(psConfig.scripts.help)
    const commandIsHelp =
      isEqual(specifiedScripts[0], 'help') && !hasHelpScript
    const shouldShowSpecificScriptHelp =
      commandIsHelp && specifiedScripts.length > 1
    if (shouldShowSpecificScriptHelp) {
      log.info(specificHelpScript(psConfig, specifiedScripts[1]))
      return true
    } else if (commandIsHelp || noScriptSpecifiedAndNoDefault) {
      // Can't achieve 100% branch coverage without refactoring this showHelp()
      // function into ./index.js and re-working existing tests and such. Branch
      // options aren't relevant here either, so telling Istanbul to ignore.
      /* istanbul ignore next */
      if (helpStyle === 'all') {
        parser.showHelp('log')
      }
      log.info(help(psConfig))
      return true
    }

    return false
  }

  function getInitCommand() {
    const command = 'init'
    const description = 'automatically migrate from npm scripts to nps'
    return [command, description, getConfig, onInit]

    function getConfig(initYargs) {
      return initYargs.usage('Usage: $0 init [options]').options({
        config: configOption,
        type: {
          describe: 'The type of config to generate',
          choices: ['js', 'yml'],
          default: 'js',
        },
      })
    }

    function onInit(initArgv) {
      commandExecuted = true
      const path = getPSConfigFilepath(initArgv)
      const fileExists = typeof path === 'string' && Boolean(findUp.sync(path))
      if (fileExists) {
        if (
          !keyInYN(
            chalk.yellow(`Do you want to overwrite your existing config file?`),
          )
        ) {
          log.info(
            chalk.yellow(
              `Exiting. Please specify a different config file to use on init.`,
            ),
          )
          return
        }
      }
      const init = initialize(initArgv.type)
      if (!init) {
        log.error(chalk.red('Unable to find an existing package.json'))
        return
      }
      const packageScriptsPath = init.packageScriptsPath
      log.info(
        `Your scripts have been saved at ${chalk.green(packageScriptsPath)}`,
      )
      log.info(
        chalk.gray(
          oneLine`
            Check out your scripts in there. Go ahead and
            update them and add descriptions to the ones
            that need it
          `,
        ),
      )
      log.info(
        chalk.gray(
          oneLine`
            Your package.json scripts have also been updated. Run
            \`npm start help\` for help
          `,
        ),
      )
      log.info(
        chalk.gray(
          oneLine`
            You may also want to install the package globally and
            installing autocomplete script. You can do so by running
            \n  npm install --global nps
            \n  nps completion >> <your-bash-profile-file>
          `,
        ),
      )
    }
  }

  /* istanbul ignore next */
  function completionHandler(currentInput, currentArgv) {
    commandExecuted = true
    const {scripts} = getPSConfig(currentArgv) || {}
    if (scripts) {
      return getCompletionScripts(scripts, currentInput)
    }
    return []
  }

  function getInvalidFlags() {
    const customFlags = Object.keys(yargsInstance.getOptions().default)
    const allowedFlags = [
      ...customFlags,
      'v',
      'version',
      'h',
      'help',
      '$0',
      '_',
    ]
    return Object.keys(parsedArgv).filter(key => !includes(allowedFlags, key))
  }

  function getPSConfigFilepath({config} = {}) {
    if (config) {
      return config
    }
    return (
      findUp.sync('package-scripts.js') ||
      findUp.sync('package-scripts.yml') ||
      findUp.sync('package-scripts.yaml')
    )
  }
}

function getCLIConfig() {
  const configPath = findUp.sync('.npsrc') || findUp.sync('.npsrc.json')

  if (!configPath) {
    return {}
  }

  return loadCLIConfig(configPath)
}

function getPSConfig(parsedArgv) {
  if (parsedArgv.require) {
    preloadModule(parsedArgv.require)
  }
  const configFilepath = parsedArgv.config
  if (!configFilepath) {
    log.warn({
      message: chalk.yellow(
        'Unable to find a config file and none was specified.',
      ),
      ref: 'unable-to-find-config',
    })
    return undefined
  }
  return loadConfig(configFilepath, parsedArgv._)
}

function shouldExitProcess(rawArgv) {
  return !(isEqual(rawArgv, ['-h']) || isEqual(rawArgv, ['--help']))
}
