import resolveScriptObjectToString from './resolve-script-object-to-string'
import get from 'lodash.get'
import prefixToScriptName from './prefix-to-script-name'
import kebabAndCamelCasify from './kebab-and-camel-casify'

export default getScriptToRun

function getScriptToRun(config, input) {
  config = kebabAndCamelCasify(config)
  input = prefixToScriptName(input, config)[0] || input // allow prefix
  const script = get(config, input)
  return resolveScriptObjectToString(script)
}
