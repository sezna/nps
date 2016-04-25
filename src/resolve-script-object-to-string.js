import isString from 'lodash.isstring'
import isPlainObject from 'lodash.isplainobject'
import isUndefined from 'lodash.isundefined'
export default resolveScriptObjectToString

function resolveScriptObjectToString(script) {
  if (isPlainObject(script)) {
    if (!isUndefined(script.script)) {
      return script.script
    } else if (!isUndefined(script.default)) {
      return resolveScriptObjectToString(script.default)
    }
  } else if (isString(script)) {
    return script
  }
  return undefined
}
