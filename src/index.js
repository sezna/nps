import spawn from 'spawn-command-with-kill'
import Promise from 'bluebird'
import colors from 'colors/safe'
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
  if (options.parallel) {
    return runParallel()
  } else {
    return runSeries()
  }

  function runSeries() {
    return scriptNames.reduce((res, scriptName) => {
      return res.then(() => (
        runPackageScript({scriptConfig, options, scriptName, args})
      ))
    }, Promise.resolve())
  }

  function runParallel() {
    const results = scriptNames.map(script => ({script, code: undefined}))
    let aborted = false

    const promises = scriptNames.map(scriptName => {
      return runPackageScript({scriptConfig, options, scriptName, args})
    })

    const allPromise = Promise.all(promises.map((promise, index) => {
      return promise.then(code => {
        results[index].code = code
      })
    })).then(() => results)

    allPromise.catch(() => {
      /* istanbul ignore if */
      if (aborted) {
        // this is very unlikely to happen
      } else {
        abortAll()
      }
    })

    return allPromise

    function abortAll() {
      aborted = true
      promises.forEach(p => p.abort())
    }
  }
}


function runPackageScript({scriptConfig, options, scriptName, args}) {
  const scripts = getScriptsFromConfig(scriptConfig, scriptName)
  const script = getScriptToRun(scripts, scriptName)
  if (!isString(script)) {
    return Promise.reject({
      message: colors.red(
        `Scripts must resolve to strings. There is no script that can be resolved from "${scriptName}"`
      ),
      ref: 'missing-script',
    })
  }
  const command = [script, args].join(' ').trim()
  const log = getLogger(getLogLevel(options))
  log.info(colors.gray('nps executing: ') + colors.green(command))
  let child
  const promise = new Promise((resolve, reject) => {
    child = spawn(command, {stdio: 'inherit', env: getEnv()})

    child.on('error', error => {
      child = null
      reject({
        message: colors.red(
          `The script called "${scriptName}" which runs "${command}" emitted an error`
        ),
        ref: 'emitted-an-error',
        error,
      })
    })

    child.on('close', code => {
      child = null
      if (code === NON_ERROR) {
        resolve(code)
      } else {
        reject({
          message: colors.red(
            `The script called "${scriptName}" which runs "${command}" failed with exit code ${code}`
          ),
          ref: 'failed-with-exit-code',
          code,
        })
      }
    })
  })

  promise.abort = function abort() {
    if (child !== null) {
      child.kill()
      child = null
    }
  }

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
