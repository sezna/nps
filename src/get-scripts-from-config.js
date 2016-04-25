import isPlainObject from 'lodash.isplainobject'
import isFunction from 'lodash.isfunction'
export default getScriptsFromConfig

function getScriptsFromConfig({scripts} = {}, input) {
  if (isPlainObject(scripts)) {
    return scripts
  } else if (isFunction(scripts)) {
    return scripts(input)
  }
  return {}
}
