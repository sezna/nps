const exec = require('child_process').exec
// import spawn from 'spawn-command-with-kill'
import {assign, clone} from 'lodash'
import managePath from 'manage-path'
import {sync as findUpSync} from 'find-up'

const NON_ERROR = 0

export default getEnv

function getEnv() {
  return new Promise((resolve, reject) => {
    getNpmEnvVariables()
      .then(npmVars => {
        const env = assign(clone(process.env), npmVars)
        const alterPath = managePath(env)
        const npmBin = findUpSync('node_modules/.bin')
        if (npmBin) {
          alterPath.unshift(npmBin)
        }
        resolve(env)
      })
      .catch(reject)
  })
}

function getNpmEnvVariables() {
  let child
  return new Promise((resolve, reject) => {
    let output = ''
    child = exec('npm run env')

    child.stdout.on('data', chunk => output += chunk)

    // NOTE: not sure what needs to happen with error logging
    child.stderr.on('data', data => console.log(`stderr: ${data}`))

    child.on('close', code => {
      if (code === NON_ERROR) {
        let npmVariables = parseNpmRunEnvOutput(output)
        resolve(npmVariables)
      } else {
        // NOTE: again, not sure how we want to handle errors being logged
        reject('npm run env exited with status code:', code)
      }
    })
  })
}

function parseNpmRunEnvOutput (output) {
  return output
    .trim()
    .split('\n')
    .slice(3)
    .map(line => line.split('='))
    .reduce((acc, [key, val]) => {
      acc[key] = val
      return acc
    }, {})
}
