/* eslint no-console:0 */
import console from 'console' // to allow easy rewiring
import spawn from 'spawn-command'
import async from 'async'
import colors from 'colors/safe'
import isString from 'lodash.isstring'
import find from 'lodash.find'
import arrify from 'arrify'
import getScriptToRun from './get-script-to-run'
import getScriptsFromConfig from './get-scripts-from-config'

const noop = () => {} // eslint-disable-line func-style

export default runPackageScripts

function runPackageScripts({scriptConfig, scripts, args, options}, callback = noop) {
  const scriptNames = arrify(scripts)
  async.map(scriptNames, (scriptName, cb) => {
    const child = runPackageScript({scriptConfig, options, scriptName, args})
    if (child instanceof Error) {
      cb(child)
    } else {
      child.on('exit', exitCode => cb(null, exitCode))
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
    return new Error('scripts must resolve to strings')
  }
  const command = [script, args].join(' ').trim()
  if (!options.silent) {
    console.log(colors.gray('p-s executing: ') + colors.green(command))
  }
  return spawn(command, {stdio: 'inherit', env: process.env})
}
