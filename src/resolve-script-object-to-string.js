import {isString, isPlainObject, isUndefined} from 'lodash'

export {resolveScriptObjectToString as default, resolveScriptObjectToScript}

function resolveScriptObjectToString(script) {
  const scriptObj = resolveScriptObjectToScript(script)
  if (isPlainObject(scriptObj)) {
    return scriptObj.script
  } else if (isString(scriptObj)) {
    return scriptObj
  }
  return undefined
}

function resolveScriptObjectToScript(script) {
  if (isPlainObject(script)) {
    if (!isUndefined(script.script)) {
      return script
    } else if (!isUndefined(script.default)) {
      return script.default
    }
  } else if (isString(script)) {
    return {script}
  }
  return undefined
}
