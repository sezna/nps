import spawn from 'spawn-command-with-kill'
import Promise from 'bluebird'
import colors from 'colors/safe'
import {isString, isUndefined, clone} from 'lodash'
import {sync as findUpSync} from 'find-up'
import managePath from 'manage-path'
import arrify from 'arrify'
import getScriptToRun from './get-script-to-run'
import getScriptsFromConfig from './get-scripts-from-config'
import getLogger from './get-logger'

const NON_ERROR = 0

export default runPackageScripts

/*
  scriptConfig: Object which is exported by package-scripts.js
  scripts: the scripts (yes array) which are to be executed now,
    eg. for `nps foo` scripts is ["foo"]
    eg. for `nps foo,bar,baz` scripts is ["foo", "bar", "baz"]
  args: args passed to the run command
    eg. for `npm start foo -- --arg1 --arg2` and if scriptConfig is { foo: "echo bar" }
    the args will be ["arg1", "arg2"]
  options: { parallel: true/false, logLevel: one of "error", "warn", "info", silent: true/false }
*/

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
        runPackageScriptWithLifecycle({scriptConfig, options, scriptName, args})
      ))
    }, Promise.resolve())
  }

  function runParallel() {
    const results = scriptNames.map(script => ({script, code: undefined}))
    let aborted = false

    const promises = scriptNames.map(scriptName => {
      return runPackageScriptWithLifecycle({scriptConfig, options, scriptName, args})
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

function runPackageScriptWithLifecycle({scriptConfig, options, scriptName, args}) {
  const scripts = getScriptsFromConfig(scriptConfig, scriptName)
  const scriptObj = getScriptToRun(scripts, scriptName)

  const {pre, script, post} = scriptObj

  /*
  * The args parameter is an empty [] for pre and post scripts.
  * Reason: https://docs.npmjs.com/cli/run-script
  * The arguments will only be passed to the script specified
  * after npm run and not to any pre or post script.
  */

  const preScriptPromise = runPackageScript({
    script: pre,
    options,
    scriptName: `pre${scriptName}`,
    args: [],
  })
  const scriptPromise = runPackageScript({
    script,
    options,
    scriptName,
    args,
  })
  const postScriptPromise = runPackageScript({
    script: post,
    options,
    scriptName: `post${scriptName}`,
    args: [],
  })

  const promise = preScriptPromise
    .then(() => scriptPromise)
    .then(() => postScriptPromise)

  promise.abort = function abort() {
    if (preScriptPromise.abort) {
      preScriptPromise.abort()
    }

    scriptPromise.abort()

    if (postScriptPromise.abort) {
      postScriptPromise.abort()
    }
  }
  return promise
}

function runPackageScript({script, options, scriptName, args}) {

  if (isUndefined(script)) {
    return Promise.resolve()
  }
  // console.log("Running ->", script, scriptName)
  if (!isString(script)) {
    return Promise.reject({
      message: colors.red(
        `Scripts must resolve to strings. There is no script that can be resolved from "${scriptName}"`,
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
          `The script called "${scriptName}" which runs "${command}" emitted an error`,
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
            `The script called "${scriptName}" which runs "${command}" failed with exit code ${code}`,
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
