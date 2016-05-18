import prefixMatches from 'prefix-matches'
import kebabAndCamelCasify from './kebab-and-camel-casify'

export default function getScriptEnv(config, input) {
  if (!config) {
    return {}
  }
  config = kebabAndCamelCasify(config)
  let env = prefixMatches(input, config)[0]
  while (!env) {
    input = input.split('.').slice(0, -1).join('.')
    env = prefixMatches(input, config)[0]
  }
  return env
}
