import spawn from 'spawn-command-with-kill'
import chalk from 'chalk'
import {isString, clone} from 'lodash'
import {sync as findUpSync} from 'find-up'
import managePath from 'manage-path'
import arrify from 'arrify'
import getScriptToRun from './get-script-to-run'
import getScriptsFromConfig from './get-scripts-from-config'
import getLogger from './get-logger'

const NON_ERROR = 0

export default runPackageScripts

function runPackageScripts({scriptConfig, scripts, args, options = {}}) {
  if (scripts.length === 0) {
    scripts = ['default']
  }
  const scriptNames = arrify(scripts)

  return scriptNames.reduce((res, scriptName) => {
    return res.then(() => (
      runPackageScript({scriptConfig, options, scriptName, args})
    ))
  }, Promise.resolve())
}


function runPackageScript({scriptConfig, options, scriptName, args}) {
  const scripts = getScriptsFromConfig(scriptConfig, scriptName)
  const script = getScriptToRun(scripts, scriptName)
  if (!isString(script)) {
    return Promise.reject({
      message: chalk.red(
        `Scripts must resolve to strings. There is no script that can be resolved from "${scriptName}"`,
      ),
      ref: 'missing-script',
    })
  }
  const command = [script, args].join(' ').trim()
  const log = getLogger(getLogLevel(options))
  log.info(chalk.gray('nps executing: ') + chalk.green(command))
  let child
  const promise = new Promise((resolve, reject) => {
    child = spawn(command, {stdio: 'inherit', env: getEnv()})

    child.on('error', error => {
      reject({
        message: chalk.red(
          `The script called "${scriptName}" which runs "${command}" emitted an error`,
        ),
        ref: 'emitted-an-error',
        error,
      })
    })

    child.on('close', code => {
      if (code === NON_ERROR) {
        resolve(code)
      } else {
        reject({
          message: chalk.red(
            `The script called "${scriptName}" which runs "${command}" failed with exit code ${code}`,
          ),
          ref: 'failed-with-exit-code',
          code,
        })
      }
    })
  })

  return promise
}

function getLogLevel({silent, logLevel}) {
  if (logLevel) {
    return logLevel
  } else if (silent) {
    return 'disable'
  } else {
    return undefined
  }
}

function getEnv() {
  const env = clone(process.env)
  const alterPath = managePath(env)
  const npmBin = findUpSync('node_modules/.bin')
  if (npmBin) {
    alterPath.unshift(npmBin)
  }
  return env
}
