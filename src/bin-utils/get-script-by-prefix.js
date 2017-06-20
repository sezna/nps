import prefixMatches from 'prefix-matches'
import {keys, isPlainObject, isString, has} from 'lodash'

/*
  Converts a string or object with a "script" key into an object with
   {
    name,
    script,
    description
   }
*/
export function scriptToObject(name, scriptArg) {
  if (isString(scriptArg)) {
    return {
      name,
      script: scriptArg,
      description: '',
    }
  }
  if (isPlainObject(scriptArg)) {
    if (has(scriptArg, 'default')) {
      return scriptToObject(`${name}.default`, scriptArg.default)
    } else {
      const description = scriptArg.description || ''
      const script = scriptArg.script
      return {
        name,
        description,
        script,
      }
    }
  }
  return null
}

export function isValidScript(script) {
  if (isString(script)) {
    return true
  } else if (isPlainObject(script)) {
    if (has(script, 'default')) {
      return isValidScript(script.default)
    }
    return has(script, 'script')
  } else {
    return false
  }
}

export default function getScriptByPrefix({scripts}, prefix) {
  const matches = prefixMatches(prefix, scripts)
  for (const match of matches) {
    const matchedKeys = keys(match)
    const name = matchedKeys[0]
    const script = match[name]
    if (isValidScript(script)) {
      return scriptToObject(name, script)
    }
  }
  return null
}
