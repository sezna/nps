import {isPlainObject, camelCase, kebabCase} from 'lodash'

export default kebabAndCamelCasify

function kebabAndCamelCasify(obj) {
  return Object.keys(obj).reduce(
    (result, key) => {
      const camel = camelCase(key)
      const kebab = kebabCase(key)
      let val = obj[key]
      if (isPlainObject(obj[key])) {
        val = kebabAndCamelCasify(val)
      }
      if (key !== camel || key !== kebab) {
        result[camel] = val
        result[kebab] = val
      } else {
        result[key] = val
      }
      return result
    },
    obj,
  )
}
