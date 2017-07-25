import {resolve, dirname} from 'path'
import {writeFileSync} from 'fs'
import {sync as findUpSync} from 'find-up'
import {
  isPlainObject,
  camelCase,
  set,
  each,
  includes,
  startsWith,
} from 'lodash'
import {safeDump} from 'js-yaml'
import stringifyObject from './stringify-object'

export default initialize

const CORE_SCRIPTS = [
  'applypatchmsg',
  'commitmsg',
  'install',
  'postapplypatch',
  'postcheckout',
  'postcommit',
  'postinstall',
  'postmerge',
  'postpublish',
  'postreceive',
  'postrestart',
  'postrewrite',
  'poststart',
  'poststop',
  'posttest',
  'postuninstall',
  'postupdate',
  'postversion',
  'preapplypatch',
  'preautogc',
  'precommit',
  'preinstall',
  'preparecommitmsg',
  'prepublish',
  'prepush',
  'prerebase',
  'prereceive',
  'prerestart',
  'prestart',
  'prestop',
  'pretest',
  'preuninstall',
  'preversion',
  'publish',
  'pushtocheckout',
  'restart',
  'stop',
  'uninstall',
  'update',
  'version',
]

function initialize(configType = 'js') {
  /* eslint global-require:0,import/no-dynamic-require:0 */
  const packageJsonPath = findUpSync('package.json')
  const packageJson = require(packageJsonPath)
  const {scripts = {}} = packageJson
  packageJson.scripts = getCoreScripts(packageJson.scripts)
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

  if (configType === 'yaml') {
    return dumpYAMLConfig(packageJsonPath, scripts)
  }

  return dumpJSConfig(packageJsonPath, scripts)
}

function dumpJSConfig(packageJsonPath, scripts) {
  const packageScriptsPath = resolve(
    dirname(packageJsonPath),
    './package-scripts.js',
  )
  const fileContents = generatePackageScriptsFileContents(scripts)
  writeFileSync(packageScriptsPath, fileContents)

  return {packageJsonPath, packageScriptsPath}
}

function dumpYAMLConfig(packageJsonPath, scripts) {
  const packageScriptsPath = resolve(
    dirname(packageJsonPath),
    './package-scripts.yml',
  )
  const fileContents = safeDump({scripts: structureScripts(scripts)})
  writeFileSync(packageScriptsPath, fileContents)

  return {packageJsonPath, packageScriptsPath}
}

function generatePackageScriptsFileContents(scripts) {
  const indent = '    ' // start at 4 spaces because we're inside another object
  const structuredScripts = structureScripts(scripts)
  const objectString = stringifyObject(structuredScripts, indent)
  return `module.exports = {\n  scripts: {${objectString}\n  }\n};\n`
}

function structureScripts(scripts) {
  // start out by giving every script a `default`
  const defaultedScripts = Object.keys(scripts)
    .filter(isNotCoreScript)
    .reduce((obj, scriptKey) => {
      const keyParts = scriptKey.split(':')
      const isKeyScriptHook = isScriptHook(keyParts[0])
      const deepKey = convertToNpsScript(keyParts)
      let defaultDeepKey = `${deepKey}.default`
      if (scriptKey.indexOf('start') === 0) {
        defaultDeepKey = [
          'default',
          ...keyParts.slice(1, keyParts.length),
          'default',
        ].join('.')
      }
      let script = scripts[scriptKey]
      if (!isKeyScriptHook) {
        const {preHook, postHook} = getPrePostHooks(
          scripts,
          scriptKey,
          deepKey,
        )
        if (isNpmRunCommand(script)) {
          script = convertToNpsCommand(script)
        }
        script = `${preHook}${script}${postHook}`
      }
      set(obj, defaultDeepKey, script)
      return obj
    }, {})
  // traverse the object and replace all objects that
  // only have `default` with just the script itself.
  traverse(defaultedScripts, removeDefaultOnly)
  return defaultedScripts

  function removeDefaultOnly(key, value, object) {
    if (isOnlyDefault(value)) {
      object[key] = value.default
    }
  }
}

function traverse(object, fn) {
  each(object, (value, key) => {
    // we don't need to worry about a recursive structure in this case
    fn(key, value, object)
    value = object[key] // may have changed from `fn`
    if (isPlainObject(value)) {
      traverse(value, fn)
    }
  })
}

function getCoreScripts(scripts = {}) {
  const DEFAULT_CORE_SCRIPTS = {
    start: 'nps',
    test: scripts.test ? 'nps test' : undefined,
  }
  const coreScripts = Object.keys(scripts).reduce((result, scriptKey) => {
    if (!isNotCoreScript(scriptKey)) {
      result[scriptKey] = scripts[scriptKey]
    }
    return result
  }, {})
  return Object.assign(DEFAULT_CORE_SCRIPTS, coreScripts)
}

function convertToNpsCommand(npmRunCommand) {
  const [, , commandToRun, , ...args] = npmRunCommand.split(' ')
  const hasArgs = args.length > 0
  let npsScript = convertToNpsScript(commandToRun.split(':'))
  if (hasArgs) {
    const npsScriptArgs = args.join(' ')
    npsScript = `"${npsScript} ${npsScriptArgs}"`
  }
  return `nps ${npsScript}`
}

function getPrePostHooks(scripts, scriptKey, deepKey) {
  const preHook = scripts[`pre${scriptKey}`] ? `nps pre${deepKey} && ` : ''
  const postHook = scripts[`post${scriptKey}`] ? ` && nps post${deepKey}` : ''
  return {
    preHook,
    postHook,
  }
}

function convertToNpsScript(keyParts) {
  return keyParts.map(key => camelCase(key)).join('.')
}

function isOnlyDefault(script) {
  return (
    isPlainObject(script) && Object.keys(script).length === 1 && script.default
  )
}

function isScriptHook(script) {
  return script.indexOf('pre') === 0 || script.indexOf('post') === 0
}

function isNotCoreScript(script) {
  return !includes(CORE_SCRIPTS, script)
}

function isNpmRunCommand(script) {
  return startsWith(script.trim(), 'npm run')
}
