/* eslint no-invalid-this:"off" */
import omelette from 'omelette'
import {includes, isPlainObject, kebabCase} from 'lodash'

const complete = omelette('nps <script>')

export {autocomplete as default, install}

function autocomplete(config = {}) {
  complete.on('script', onScript)
  complete.init()

  function onScript() {
    this.reply(getScripts(config.scripts)) // eslint-disable-line babel/no-invalid-this
  }
}

function install(destination) {
  complete.setupShellInitFile(destination)
}

function getScripts(scriptsObject, prefix = '', allScripts = []) {
  const excludedKeys = ['default', 'script', 'description']
  return Object.keys(scriptsObject).reduce((acc, key) => {
    if (includes(excludedKeys, key)) {
      return acc
    }
    const value = scriptsObject[key]
    const kebabKey = kebabCase(key)
    const deepKey = prefix ? `${prefix}.${kebabKey}` : kebabKey
    acc.push(deepKey)
    if (isPlainObject(value)) {
      getScripts(value, deepKey, acc)
    }
    return acc
  }, allScripts)
}
