import {each, cloneDeep, isPlainObject, isUndefined, isString} from 'lodash'
import prefixMatches from 'prefix-matches'
import resolveScriptObjectToString from './resolve-script-object-to-string'
import kebabAndCamelCasify from './kebab-and-camel-casify'

export default getScriptToRun

function getScriptToRun(config, input) {
  config = kebabAndCamelCasify(config)
  // remove the default objects/strings so we cancheck
  // if the prefix works with another script first
  const defaultlessConfig = removeDefaults(cloneDeep(config))
  const scriptToRun = getScript(defaultlessConfig, input)
  if (!isUndefined(scriptToRun) && isString(scriptToRun.script)) {
    return scriptToRun
  } else {
    // fallback to the defaults if no other script was
    // found with the given input
    return getScript(config, input)
  }
}

function getScript(config, input) {
  // will always return an empty array if no result where found
  const matchingScripts = prefixMatches(input, config)

  if (matchingScripts.length !== 0) {
    const script = matchingScripts.reduce((script, possibleScript) => {
      if (possibleScript[input]) {
        return possibleScript
      }
      return script
    })

    const scriptName = Object.keys(script).shift()
    let scriptToRun = script[scriptName]
    if (scriptName && isPlainObject(scriptToRun)) {
      scriptToRun = resolveScriptObjectToString(scriptToRun)
    }
    return {
      scriptName,
      script: scriptToRun,
    }
  }
  return undefined
}

function removeDefaults(object) {
  each(object, (value, key) => {
    if (key === 'default') {
      delete object[key]
    } else if (isPlainObject(value)) {
      object[key] = removeDefaults(value)
    }
  })
  return object
}
