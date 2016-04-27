import remove from 'lodash.remove'
import contains from 'lodash.contains'
import isPlainObject from 'lodash.isplainobject'
import shellEscape from 'shell-escape'
import isEmpty from 'lodash.isempty'
import colors from 'colors/safe'

import {resolveScriptObjectToScript} from './resolve-script-object-to-string'

export {getScriptsAndArgs, help}

function getScriptsAndArgs(program) {
  let scripts, args, parallel
  if (!isEmpty(program.parallel)) {
    scripts = program.parallel.split(',')
    args = getArgs(program.args, program.rawArgs, scripts)
    parallel = true
  } else {
    scripts = program.args[0].split(',')
    args = getArgs(program.args.slice(1), program.rawArgs, scripts)
    parallel = false
  }
  return {scripts, args, parallel}
}

function getArgs(args, rawArgs, scripts) {
  const allArgs = rawArgs.slice(2)
  const psArgs = ['-p', '--parallel', '-c', '--config']
  const psFlags = ['-s', '--silent']
  const cleanedArgs = remove(allArgs, (item, index, arry) => {
    const isArgOrFlag = contains(psArgs, item) || contains(psFlags, item)
    const isArgValue = contains(psArgs, arry[index - 1])
    const isInScripts = contains(scripts, item)
    return !isArgOrFlag && !isArgValue && !isInScripts
  })
  return shellEscape(cleanedArgs)
}

function help({scripts}) {
  const availableScripts = getAvailableScripts(scripts)
  const scriptLines = availableScripts.map(({name, description, script}) => {
    const coloredName = colors.green(name)
    const coloredScript = colors.gray(script)
    let line
    if (description) {
      line = [coloredName, colors.white(description), coloredScript]
    } else {
      line = [coloredName, coloredScript]
    }
    return line.join(' - ').trim()
  })
  if (!scriptLines.length) {
    return colors.yellow('There are no scripts available')
  } else {
    const topMessage = 'Available scripts (camel or kebab case accepted)'
    const message = `${topMessage}\n\n${scriptLines.join('\n')}`
    return message
  }
}

function getAvailableScripts(config, prefix) {
  const excluded = ['description', 'script', 'default']
  return Object.keys(config).reduce((scripts, key) => {
    const val = config[key]
    if (contains(excluded, key)) {
      return scripts
    }
    const scriptObj = resolveScriptObjectToScript(val)
    if (scriptObj) {
      const {description, script} = scriptObj
      const prefixed = prefix ? [prefix, key] : [key]
      scripts = [...scripts, {name: prefixed.join('.'), description, script}]
    }
    if (isPlainObject(val)) {
      return [...scripts, ...getAvailableScripts(val, key)]
    }
    return scripts
  }, [])
}
