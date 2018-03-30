import spawn from 'spawn-command-with-kill'
import chalk from 'chalk'
import {oneLine} from 'common-tags'
import {isString} from 'lodash'
import arrify from 'arrify'
import getScriptToRun from './get-script-to-run'
import getScriptsFromConfig from './get-scripts-from-config'
import getLogger, {getLogLevel} from './get-logger'
import getEnv from './get-env-variables'

const NON_ERROR = 0

export default runPackageScripts

function runPackageScripts({scriptConfig, scripts, options = {}}) {
  if (scripts.length === 0) {
    scripts = ['default']
  }
  let scriptNames = arrify(scripts)

  const separatorIndex = scriptNames.indexOf('--')
  if (separatorIndex >= 0) {
    const additionalOptions = scriptNames.slice(separatorIndex + 1).join(' ')
    if (separatorIndex === 0) {
      scriptNames = [`default ${additionalOptions}`]
    } else {
      scriptNames.splice(separatorIndex)
      const lastIndex = scriptNames.length - 1
      scriptNames[lastIndex] = `${scriptNames[lastIndex]} ${additionalOptions}`
    }
  }

  return scriptNames.reduce((res, input) => {
    return res.then(() => runPackageScript({scriptConfig, options, input}))
  }, Promise.resolve())
}

function runPackageScript({scriptConfig, options, input}) {
  const [scriptPrefix, ...args] = input.split(' ')
  const scripts = getScriptsFromConfig(scriptConfig, scriptPrefix)
  const {scriptName, script} = getScriptToRun(scripts, scriptPrefix) || {}
  if (!isString(script)) {
    return Promise.reject({
      message: chalk.red(
        oneLine`
          Scripts must resolve to strings.
          There is no script that can be resolved from "${scriptPrefix}"
        `,
      ),
      ref: 'missing-script',
    })
  }
  const command = [script, ...args].join(' ').trim()
  const log = getLogger(getLogLevel(options))
  const showScript = options.scripts
  log.info(
    oneLine`
    ${chalk.gray('nps is executing')}
     \`${chalk.bold(scriptName)}\`
     ${showScript ? `: ${chalk.green(command)}` : ''}
  `,
  )
  let child

  return new Promise((resolve, reject) => {
    getEnv()
      .then(env => {
        child = spawn(command, {stdio: 'inherit', env})

        child.on('error', error => {
          reject({
            message: chalk.red(
              oneLine`
                The script called "${scriptPrefix}"
                which runs "${command}" emitted an error
              `,
            ),
            ref: 'emitted-an-error',
            error,
          })
        })

        child.on('close', code => {
          if (code === NON_ERROR) {
            resolve(code)
          } else {
            reject({
              message: chalk.red(
                oneLine`
                  The script called "${scriptPrefix}"
                  which runs "${command}" failed with exit code ${code}
                `,
              ),
              ref: 'failed-with-exit-code',
              code,
            })
          }
        })
      })
      .catch(err => console.log('PROMISE ERROR', err))
  })
}

