import spawn from 'spawn-command'
import async from 'async'
import colors from 'colors/safe'
import {isString, find, clone} from 'lodash'
import {sync as findUpSync} from 'find-up'
import managePath from 'manage-path'
import arrify from 'arrify'
import getScriptToRun from './get-script-to-run'
import getScriptsFromConfig from './get-scripts-from-config'
import getLogger from './get-logger'

const noop = () => {} // eslint-disable-line func-style, no-empty-function

export default runPackageScripts

function runPackageScripts({scriptConfig, scripts, args, options}, callback = noop) {
  const scriptNames = arrify(scripts)
  async.map(scriptNames, (scriptName, cb) => {
    const child = runPackageScript({scriptConfig, options, scriptName, args})
    if (child.on) {
      child.on('exit', exitCode => cb(null, exitCode))
    } else {
      cb(child)
    }
  }, (err, results) => {
    if (err) {
      callback({error: err})
    } else {
      const NON_ERROR = 0
      const result = find(results, r => r !== NON_ERROR)
      callback({code: result})
    }
  })
}

function runPackageScript({scriptConfig, options = {}, scriptName, args}) {
  const scripts = getScriptsFromConfig(scriptConfig, scriptName)
  const script = getScriptToRun(scripts, scriptName)
  if (!isString(script)) {
    return {
      message: colors.red(
        `Scripts must resolve to strings. There is no script that can be resolved from "${scriptName}"`
      ),
      ref: 'missing-script',
    }
  }
  const command = [script, args].join(' ').trim()
  const log = getLogger(getLogLevel(options))
  log.info(colors.gray('p-s executing: ') + colors.green(command))
  return spawn(command, {stdio: 'inherit', env: getEnv()})
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
