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

function isValidScript(script) {
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
  // This array holds all the valid scripts in
  // the order of priority (default scripts have lowest priority)
  const matchedScriptsSortedByPriority = []
  for (const match of matches) {
    const matchedKeys = keys(match)
    const name = matchedKeys[0]
    const script = match[name]
    if (isValidScript(script)) {
      if (has(script, 'default')) {
        // if it's a default script, push to the last of the array
        matchedScriptsSortedByPriority.push({
          name,
          script,
        })
      } else {
        // if it's not a default script, push to the first of the array
        matchedScriptsSortedByPriority.unshift({
          name,
          script,
        })
      }
    }
  }
  if (matchedScriptsSortedByPriority.length) {
    const {name, script} = matchedScriptsSortedByPriority[0]
    return scriptToObject(name, script)
  }
  return null
}
