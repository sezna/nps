import {resolve, dirname} from 'path'
import {writeFileSync} from 'fs'
import {sync as findUpSync} from 'find-up'
import {isPlainObject, camelCase, set, each} from 'lodash'

export default initialize

function initialize() {
  const packageJsonPath = findUpSync('package.json')
  const packageScriptsPath = resolve(dirname(packageJsonPath), './package-scripts.js')
  const packageJson = require(packageJsonPath) // eslint-disable-line global-require
  const {scripts} = packageJson
  const fileContents = generatePackageScriptsFileContents(scripts)
  packageJson.scripts = {
    start: 'package-scripts',
    test: scripts.test ? 'package-scripts test' : undefined,
  }
  writeFileSync(packageScriptsPath, fileContents)
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
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
  const defaultedScripts = Object.keys(scripts).reduce((obj, key) => {
    const keyParts = key.split(':')
    let deepKey = [...keyParts, 'default'].join('.')
    if (key.indexOf('start') === 0) {
      deepKey = ['default', ...keyParts.slice(1, keyParts.length), 'default'].join('.')
    }
    const script = scripts[key]
    set(obj, deepKey, script)
    return obj
  }, {})
  // traverse the object and replace all objects that only have `default` with just the script itself.
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
  return Object.keys(object).reduce((string, key, index) => {
    const script = object[key]
    let value
    if (isPlainObject(script)) {
      value = `{${jsObjectStringify(script, `${indent}  `)}\n${indent}}`
    } else {
      value = `'${escapeSingleQuote(script)}'`
    }
    const camelKey = camelCase(key)
    const comma = isLast(object, index) ? '' : ','
    return `${string}\n${indent}${camelKey}: ${value}${comma}`
  }, '')
}

function isOnlyDefault(script) {
  return isPlainObject(script) && Object.keys(script).length === 1 && script.default
}

function escapeSingleQuote(string) {
  return string.replace(/'/g, '\\\'')
}

function isLast(object, index) {
  return Object.keys(object).length - 1 === index
}
