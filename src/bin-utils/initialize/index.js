import {resolve, dirname} from 'path'
import {writeFileSync} from 'fs'
import {sync as findUpSync} from 'find-up'
import {isPlainObject, camelCase, set, each} from 'lodash'
import {safeDump} from 'js-yaml'

export default initialize

function initialize(configType = 'js') {
  /* eslint global-require:0,import/no-dynamic-require:0 */
  const packageJsonPath = findUpSync('package.json')
  const packageJson = require(packageJsonPath)
  const {scripts = {}} = packageJson
  packageJson.scripts = {
    start: 'nps',
    test: scripts.test ? 'nps test' : undefined,
  }
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
  const objectString = jsObjectStringify(structuredScripts, indent)
  return `module.exports = {\n  scripts: {${objectString}\n  }\n};\n`
}

function structureScripts(scripts) {
  // start out by giving every script a `default`
  const defaultedScripts = Object.keys(scripts).reduce((obj, scriptKey) => {
    const keyParts = scriptKey.split(':')
    const isKeyScriptHook = isScriptHook(keyParts[0])
    const deepKey = keyParts.map(key => camelCase(key)).join('.')
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
      const preHook = scripts[`pre${scriptKey}`] ? `nps pre${deepKey} && ` : ''
      const postHook = scripts[`post${scriptKey}`] ?
        ` && nps post${deepKey}` :
        ''
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

function jsObjectStringify(object, indent) {
  return Object.keys(object).reduce(
    (string, key, index) => {
      const script = object[key]
      let value
      if (isPlainObject(script)) {
        value = `{${jsObjectStringify(script, `${indent}  `)}\n${indent}}`
      } else {
        value = `'${escapeSingleQuote(script)}'`
      }
      const comma = isLast(object, index) ? '' : ','
      return `${string}\n${indent}${key}: ${value}${comma}`
    },
    '',
  )
}

function isOnlyDefault(script) {
  return isPlainObject(script) &&
    Object.keys(script).length === 1 &&
    script.default
}

function escapeSingleQuote(string) {
  return string.replace(/'/g, "\\'")
}

function isLast(object, index) {
  return Object.keys(object).length - 1 === index
}

function isScriptHook(script) {
  return script.indexOf('pre') === 0 || script.indexOf('post') === 0
}
