import {
  includes,
  kebabCase,
  camelCase,
  isPlainObject,
  startsWith,
} from 'lodash'

const excludedKeys = ['default', 'script', 'description', 'hiddenFromHelp']

export default getScripts

function getScripts(objWithScripts, prefix = '') {
  const [prefixToMatch, ...remainingToMatch] = prefix.split('.')
  return Object.keys(objWithScripts).reduce((acc, key) => {
    /* eslint complexity:0 */
    const kebabKey = kebabCase(key)
    const camelKey = camelCase(key)
    const startsWithKey = startsWith(key, prefixToMatch)
    const startsWithKebab = startsWith(kebabKey, prefixToMatch)
    const startsWithCamel = startsWith(camelKey, prefixToMatch)
    const startMatches = startsWithKey || startsWithKebab || startsWithCamel
    if (!startMatches || includes(excludedKeys, key)) {
      return acc
    }
    const value = objWithScripts[key]

    // default to kebab-case
    // eslint-disable-next-line
    const keyToPush = !isKebab(prefixToMatch) ? camelKey : kebabKey;

    if (isPlainObject(value)) {
      if ((value.default || value.script) && !remainingToMatch.length) {
        acc.push(keyToPush)
      }
      const subscripts = getScripts(value, remainingToMatch.join('.')).map(
        scriptName => `${keyToPush}.${scriptName}`,
      )
      acc = [...acc, ...subscripts]
    } else if (!remainingToMatch.length) {
      acc.push(keyToPush)
    }
    return acc
  }, [])
}

function isKebab(str) {
  return includes(str, '-')
}
