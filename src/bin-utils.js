import {resolve} from 'path'
import remove from 'lodash.remove'
import contains from 'lodash.contains'
import isPlainObject from 'lodash.isplainobject'
import shellEscape from 'shell-escape'
import isEmpty from 'lodash.isempty'
import colors from 'colors/safe'

import getLogger from './get-logger'
import {resolveScriptObjectToScript} from './resolve-script-object-to-string'

const log = getLogger()

/**
 * Attempts to load the given module. This is used for the --require functionality of the CLI
 * @param  {String} moduleName The module to attempt to require
 * @return {*} The required module
 */
const preloadModule = getAttemptModuleRequireFn((moduleName, requirePath) => {
  log.warn({
    message: colors.yellow(`Unable to preload "${moduleName}". Attempted to require as "${requirePath}"`),
    ref: 'unable-to-preload-module',
  })
  return undefined
})

/**
 * Attempts to load the config and logs an error if there's a problem
 * @param  {String} configPath The path to attempt to require the config from
 * @return {*} The required module
 */
const loadConfig = getAttemptModuleRequireFn(function onFail(configPath, requirePath) {
  log.error({
    message: colors.red(`Unable to find config at "${configPath}". Attempted to require as "${requirePath}"`),
    ref: 'unable-to-find-config',
  })
  return undefined
})

export {getScriptsAndArgs, help, getModuleRequirePath, preloadModule, loadConfig}


/****** implementations ******/

function getScriptsAndArgs(program) {
  let scripts = []
  let args = ''
  const parallel = !isEmpty(program.parallel)
  if (parallel) {
    scripts = program.parallel.split(',')
    args = getArgs(program.args, program.rawArgs, scripts)
  } else if (!isEmpty(program.args)) {
    scripts = program.args[0].split(',')
    args = getArgs(program.args.slice(1), program.rawArgs, scripts)
  }
  return {scripts, args, parallel}
}

function getArgs(args, rawArgs, scripts) {
  const allArgs = rawArgs.slice(2)
  const psArgs = ['-p', '--parallel', '-c', '--config', '-r', '--require']
  const psFlags = ['-s', '--silent']
  const cleanedArgs = remove(allArgs, (item, index, arry) => {
    const isArgOrFlag = contains(psArgs, item) || contains(psFlags, item)
    const isArgValue = contains(psArgs, arry[index - 1])
    const isInScripts = contains(scripts, item)
    return !isArgOrFlag && !isArgValue && !isInScripts
  })
  return shellEscape(cleanedArgs)
}

/**
 * Determines the proper require path for a module. If the path starts with `.` then it is resolved with process.cwd()
 * @param  {String} moduleName The module path
 * @return {String} the module path to require
 */
function getModuleRequirePath(moduleName) {
  return moduleName[0] === '.' ? resolve(process.cwd(), moduleName) : moduleName
}

function getAttemptModuleRequireFn(onFail) {
  return function attemptModuleRequire(moduleName) {
    const requirePath = getModuleRequirePath(moduleName)
    try {
      return requireDefaultFromModule(requirePath)
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw e
      }
      return onFail(moduleName, requirePath)
    }
  }
}

/**
 * Requires the given module and returns the `default` if it's an `__esModule`
 * @param  {String} modulePath The module to require
 * @return {*} The required module (or it's `default` if it's an `__esModule`)
 */
function requireDefaultFromModule(modulePath) {
  const mod = require(modulePath) // eslint-disable-line global-require
  if (mod.__esModule) {
    return mod.default
  } else {
    return mod
  }
}

function help({scripts}) {
  const availableScripts = getAvailableScripts(scripts)
  const scriptLines = availableScripts.map(({name, description, script}) => {
    const coloredName = colors.green(name)
    const coloredScript = colors.gray(script)
    let line
    if (description) {
      line = [coloredName, colors.white(description), coloredScript]
    } else {
      line = [coloredName, coloredScript]
    }
    return line.join(' - ').trim()
  })
  if (scriptLines.length) {
    const topMessage = 'Available scripts (camel or kebab case accepted)'
    const message = `${topMessage}\n\n${scriptLines.join('\n')}`
    return message
  } else {
    return colors.yellow('There are no scripts available')
  }
}

function getAvailableScripts(config, prefix = []) {
  const excluded = ['description', 'script', 'default']
  return Object.keys(config).reduce((scripts, key) => {
    const val = config[key]
    if (contains(excluded, key)) {
      return scripts
    }
    const scriptObj = resolveScriptObjectToScript(val)
    const prefixed = [...prefix, key]
    if (scriptObj) {
      const {description, script} = scriptObj
      scripts = [...scripts, {name: prefixed.join('.'), description, script}]
    }
    if (isPlainObject(val)) {
      return [...scripts, ...getAvailableScripts(val, prefixed)]
    }
    return scripts
  }, [])
}
