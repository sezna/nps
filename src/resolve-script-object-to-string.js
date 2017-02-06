import {isString, isPlainObject, isUndefined} from 'lodash'

export {resolveScriptObjectToLifecycleObject as default, resolveScriptObjectToScript}

function resolveScriptObjectToLifecycleObject(script) {
  const scriptObj = resolveScriptObjectToScript(script)
  if (isPlainObject(scriptObj)) {
    return scriptObj
  }
  return undefined
}

function resolveScriptObjectToScript(script) {
  if (isPlainObject(script)) {
    return resolvePlainObjectToScriptLifecycle(script)
  } else if (isString(script)) {
    return {script}
  }
  return undefined
}

function resolvePlainObjectToScriptLifecycle(script) {
  if (!isUndefined(script.script)) {
    return script
  }
  if (!isUndefined(script.default)) {
    return resolveScriptObjectToScript(script.default)
  }
  return undefined
}
