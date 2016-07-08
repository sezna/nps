import prefixMatches from 'prefix-matches'
import resolveScriptObjectToString from './resolve-script-object-to-string'
import kebabAndCamelCasify from './kebab-and-camel-casify'

export default getScriptToRun

function getScriptToRun(config, input) {
  config = kebabAndCamelCasify(config)
  const script = prefixMatches(input, config)[0]
  return resolveScriptObjectToString(script)
}
