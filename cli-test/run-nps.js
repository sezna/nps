import fs from 'fs'
import path from 'path'
import spawn from 'spawn-command-with-kill'

let symlinkCreated = false
const NPS_PATH = path.resolve(__dirname, './dist/bin/nps.js')

export default runNPS

function runNPS(cwd, args = '') {
  if (!symlinkCreated) {
    createSymlink()
  }
  const isRelative = cwd[0] !== '/'

  if (isRelative) {
    cwd = path.resolve(__dirname, cwd)
  }

  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const command = `node ${NPS_PATH} ${args}`
    const env = Object.assign({}, process.env)
    delete env.FORCE_COLOR
    const child = spawn(command, {cwd, env})

    child.on('error', error => {
      reject(error)
    })

    child.stdout.on('data', data => {
      stdout += data.toString()
    })

    child.stderr.on('data', data => {
      stderr += data.toString()
    })

    child.on('close', () => {
      resolve({stdout, stderr})
    })
  })
}

function createSymlink() {
  const origin = path.resolve(__dirname, '../dist')
  const dest = path.resolve(__dirname, './dist')
  try {
    fs.accessSync(dest, fs.F_OK)
  } catch (e) {
    fs.symlinkSync(origin, dest)
  } finally {
    symlinkCreated = true
  }
}
