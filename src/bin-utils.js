import remove from 'lodash.remove'
import contains from 'lodash.contains'
import shellEscape from 'shell-escape'
import isEmpty from 'lodash.isempty'

export {getScriptsAndArgs}

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
    const isScript = contains(scripts, item)
    return !isArgOrFlag && !isArgValue && !isScript
  })
  return shellEscape(cleanedArgs)
}
