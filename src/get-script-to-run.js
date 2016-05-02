import resolveScriptObjectToString from './resolve-script-object-to-string'
import get from 'lodash.get'
import prefixMatches from 'prefix-matches'
import kebabAndCamelCasify from './kebab-and-camel-casify'

export default getScriptToRun

function getScriptToRun(config, input) {
  config = kebabAndCamelCasify(config)
  const script = prefixMatches(input, config)[0] || get(config, input) // allow prefix
  return resolveScriptObjectToString(script)
}
