import {each, cloneDeep, isPlainObject} from 'lodash'
import prefixMatches from 'prefix-matches'
import resolveScriptObjectToLifecycleObject from './resolve-script-object-to-string'
import kebabAndCamelCasify from './kebab-and-camel-casify'

export default getScriptToRun

function getScriptToRun(config, input) {
  config = kebabAndCamelCasify(config)
  // remove the default objects/strings so we can check if the prefix works with another script first
  const defaultlessConfig = removeDefaults(cloneDeep(config))
  const scriptString = getScriptStringWithLifecycle(defaultlessConfig, input)
  if (scriptString && scriptString.script) {
    return scriptString
  } else {
    // fallback to the defaults if no other script was found with the given input
    return getScriptStringWithLifecycle(config, input)
  }
}

function getScriptStringWithLifecycle(config, input) {
  const [script] = prefixMatches(input, config)
  return resolveScriptObjectToLifecycleObject(script)
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
