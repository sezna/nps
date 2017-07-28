import {isPlainObject} from 'lodash'

/**
 * Converts given object to its string representation.
 * Every line is preceded by given indent.
 *
 * @param {object} object "Object to convert"
 * @param {string} indent "Indent to use"
 * @returns {string} "Stringified and indented object"
 */
function stringifyObject(object, indent) {
  return Object.keys(object).reduce((string, key, index) => {
    const script = object[key]
    let value
    if (isPlainObject(script)) {
      value = `{${stringifyObject(script, `${indent}  `)}\n${indent}}`
    } else {
      value = `'${escapeSingleQuote(script)}'`
    }
    const comma = getComma(isLast(object, index))
    return `${string}\n${indent}${key}: ${value}${comma}`
  }, '')
}

function getComma(condition) {
  return condition ? '' : ','
}

function isLast(object, index) {
  return Object.keys(object).length - 1 === index
}

function escapeSingleQuote(string) {
  return string.replace(/'/g, "\\'")
}

export default stringifyObject
