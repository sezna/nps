import {each, cloneDeep, isPlainObject} from 'lodash'
import prefixMatches from 'prefix-matches'
import resolveScriptObjectToString from './resolve-script-object-to-string'
import kebabAndCamelCasify from './kebab-and-camel-casify'

export default getScriptToRun

function getScriptToRun(config, input) {
  config = kebabAndCamelCasify(config)
  // remove the default objects/strings so we cancheck
  // if the prefix works with another script first
  const defaultlessConfig = removeDefaults(cloneDeep(config))
  const scriptString = getScriptString(defaultlessConfig, input)
  if (scriptString) {
    return scriptString
  } else {
    // fallback to the defaults if no other script was
    // found with the given input
    return getScriptString(config, input)
  }
}

function getScriptString(config, input) {
  const [script] = prefixMatches(input, config)
  return resolveScriptObjectToString(script)
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
