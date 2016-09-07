/* eslint import/newline-after-import:0, global-require:0 */
import {resolve} from 'path'
import Promise from 'bluebird'
import {spy} from 'sinon'
import color from 'colors/safe'
import {clone} from 'lodash'
import managePath from 'manage-path'

xit('spawn called with the parent process.env + npm path', () => {
  return testSpawnCallWithDefaults().then(({options: {env}}) => {
    const copy = clone(process.env)
    managePath(copy).unshift(resolve('../node_modules/.bin'))
    expect(env).toEqual(copy)
  })
})

test('does not blow up if there is no node_modules/.bin', () => {
  jest.mock('find-up', () => ({sync: () => null}))
  return testSpawnCallWithDefaults(undefined).then(({options: {env}}) => {
    expect(env).toEqual(process.env)
  })
})

test('spawn called with the expected command', () => {
  const lintCommand = 'eslint .'
  return testSpawnCall({lint: lintCommand}, 'lint').then(({command}) => {
    expect(command).toBe(lintCommand)
  })
})

test('spawn.on called with "close" and "error"', () => {
  return testSpawnCallWithDefaults().then(({onSpy}) => {
    expect(onSpy.calledTwice)
    expect(onSpy.calledWith('close'))
    expect(onSpy.calledWith('error'))
  })
})

test('returns a log object when no script is found', () => {
  const {runPackageScript} = setup()
  const scriptConfig = {lint: {script: 42}}
  return runPackageScript({scriptConfig, scripts: ['lint']}).catch(error => {
    expect(error).toEqual({
      message: color.red('Scripts must resolve to strings. There is no script that can be resolved from "lint"'),
      ref: 'missing-script',
    })
  })
})

test('options: silent sets the logLevel to disable', () => {
  const options = {silent: true}
  return testSpawnCallWithDefaults(options).then(({mockGetLogger}) => {
    expect(mockGetLogger.calledOnce)
    expect(mockGetLogger.calledWith('disable'))
  })
})

test('options: logLevel sets the log level', () => {
  const options = {logLevel: 'warn'}
  return testSpawnCallWithDefaults(options).then(({mockGetLogger}) => {
    expect(mockGetLogger.calledOnce)
    expect(mockGetLogger.calledWith('warn'))
  })
})

test('passes on additional arguments', () => {
  const lintCommand = 'eslint'
  const argsToPassOn = 'src/ scripts/'
  return testSpawnCall({lint: lintCommand}, 'lint', {}, argsToPassOn).then(({command}) => {
    expect(command).toBe(`${lintCommand} ${argsToPassOn}`)
  })
})

test('runs scripts serially if given an array of input without parallel', () => {
  const lintCommand = 'eslint'
  const buildCommand = 'babel'
  const args = 'src/ scripts/'
  const resolveSpy = spy(Promise, 'resolve')
  const {runPackageScript, mockSpawnStubSpy} = setup()
  const scripts = ['lint', 'build']
  const scriptConfig = {build: buildCommand, lint: lintCommand}
  const options = {}
  runPackageScript({scriptConfig, scripts, args, options}).then(() => {
    expect(resolveSpy.calledOnce)
    expect(mockSpawnStubSpy.calledTwice)
    const [command1] = mockSpawnStubSpy.firstCall.args
    const [command2] = mockSpawnStubSpy.secondCall.args
    expect(command1).toBe('eslint src/ scripts/')
    expect(command2).toBe('babel src/ scripts/')
  })
})

test('stops running scripts when running serially if any given script fails', () => {
  const FAIL_CODE = 1
  const badCommand = 'bad'
  const goodCommand = 'good'
  const scripts = ['badS', 'goodS']
  const scriptConfig = {
    goodS: goodCommand,
    badS: badCommand,
  }
  function spawnStub(cmd) {
    return {
      on(event, cb) {
        if (event === 'close') {
          if (cmd === badCommand) {
            cb(FAIL_CODE)
          } else {
            cb(0)
          }
        }
      },
      kill() {
      },
    }
  }
  const mockSpawnStubSpy = spy(spawnStub)
  const {runPackageScript} = setup(mockSpawnStubSpy)
  return runPackageScript({scriptConfig, scripts}).then(() => {
    throw new Error('the promise should be rejected')
  }, ({message, ref, code}) => {
    expect(code).toBe(FAIL_CODE)
    expect(typeof ref === 'string')
    expect(typeof message === 'string')
    expect(mockSpawnStubSpy.calledOnce) // only called with the bad script, not for the good one
    const [command1] = mockSpawnStubSpy.firstCall.args
    expect(command1).toBe('bad')
  })
})

test('runs scripts in parallel if given an array of input', () => {
  const lintCommand = 'eslint'
  const buildCommand = 'babel'
  const args = 'src/ scripts/'
  const {runPackageScript, mockSpawnStubSpy} = setup()
  const scripts = ['lint', 'build']
  const scriptConfig = {build: buildCommand, lint: lintCommand}
  const options = {parallel: true}
  return runPackageScript({scriptConfig, scripts, args, options}).then(() => {
    expect(mockSpawnStubSpy.calledTwice)
    const [command1] = mockSpawnStubSpy.firstCall.args
    const [command2] = mockSpawnStubSpy.secondCall.args
    expect(command1).toBe('eslint src/ scripts/')
    expect(command2).toBe('babel src/ scripts/')
  })
})

test('runs the default script if no scripts provided', () => {
  return testSpawnCall({default: 'echo foo'}, []).then(({command}) => {
    expect(command).toBe(`echo foo`)
  })
})

test('an non-zero exit code from a script will abort other scripts that are still running', () => {
  const FAIL_CODE = 1
  const goodCommand = 'goodButLong'
  const badCommand = 'bad'
  const longCommand = 'long'
  const scripts = ['goodS', 'badS', 'longS']
  const scriptConfig = {
    goodS: goodCommand,
    badS: badCommand,
    longS: longCommand,
  }
  const killSpy = spy()
  function spawnStub(cmd) {
    return {
      on(event, cb) {
        if (event === 'close') {
          if (cmd === longCommand) {
            // verifies that the promise callback wont be invoked when it's been aborted
            setTimeout(() => cb(0))
          } else if (cmd === badCommand) {
            cb(FAIL_CODE)
          } else {
            cb(0)
          }
        }
      },
      kill() {
        killSpy(cmd)
      },
    }
  }
  const {runPackageScript} = setup(spawnStub)
  const options = {parallel: true}
  return runPackageScript({scriptConfig, scripts, options}).then(() => {
    throw new Error('the promise should be rejected')
  }, ({code, ref, message}) => {
    expect(code).toBe(FAIL_CODE)
    expect(typeof ref === 'string')
    expect(typeof message === 'string')
    expect(killSpy.calledOnce) // and only once, just for the longCommand
    expect(killSpy.firstCall.args[0]).toBe(longCommand)
  })
})

test('an error event from a script will abort other scripts', () => {
  const ERROR_STRING = 'error string'
  const goodCommand = 'good'
  const badCommand = 'bad'
  const longCommand = 'long'
  const scripts = ['goodS', 'badS', 'longS']
  const scriptConfig = {
    goodS: goodCommand,
    badS: badCommand,
    longS: longCommand,
  }
  const killSpy = spy()
  function spawnStub(cmd) {
    return {
      on(event, cb) {
        if (event === 'close') {
          if (cmd === longCommand) {
            // never call the callback
            // it'll get aborted anyway.
          } else if (cmd === badCommand) {
            // do nothing in this case because we're going to call the error cb
          } else {
            cb(0)
          }
        } else if (event === 'error' && cmd === badCommand) {
          cb(ERROR_STRING)
        }
      },
      kill() {
        killSpy(cmd)
      },
    }
  }
  const {runPackageScript} = setup(spawnStub)
  const options = {parallel: true}
  return runPackageScript({scriptConfig, scripts, options}).then(() => {
    throw new Error('the promise should be rejected')
  }, ({error, ref, message}) => {
    expect(error).toBe(ERROR_STRING)
    expect(typeof ref === 'string')
    expect(typeof message === 'string')
    expect(killSpy.calledOnce) // and only once, just for the longCommand
    expect(killSpy.firstCall.args[0]).toBe(longCommand)
  })
})

// util functions

function testSpawnCallWithDefaults(options) {
  return testSpawnCall(undefined, undefined, options, undefined)
}
function testSpawnCall(scriptConfig = {build: 'webpack'}, scripts = 'build', psOptions, args) {
  /* eslint max-params:[2, 6] */ // TODO: refactor
  const {runPackageScript, mockSpawnStubSpy, ...otherRet} = setup()
  return runPackageScript({scriptConfig, options: psOptions, scripts, args})
    .then(result => {
      expect(mockSpawnStubSpy.calledOnce)
      const [command, options] = mockSpawnStubSpy.firstCall.args
      return Promise.resolve({result, command, options, mockSpawnStubSpy, ...otherRet})
    }, error => {
      expect(mockSpawnStubSpy.calledOnce)
      const [command, options] = mockSpawnStubSpy.firstCall.args
      return Promise.reject({error, command, options, mockSpawnStubSpy, ...otherRet})
    })
}

function setup(mockSpawnStubSpy) {
  const killSpy = spy()
  const onSpy = spy((event, cb) => {
    if (event === 'close') {
      cb(0)
    }
  })
  const spawnStub = () => ({on: onSpy, kill: killSpy}) // eslint-disable-line func-style
  const infoSpy = spy()
  const mockGetLogger = spy(() => ({info: infoSpy}))
  mockSpawnStubSpy = mockSpawnStubSpy || spy(spawnStub)
  jest.resetModules()
  jest.mock('spawn-command-with-kill', () => mockSpawnStubSpy)
  jest.mock('./get-logger', () => mockGetLogger)
  const runPackageScript = require('./index').default
  return {mockSpawnStubSpy, infoSpy, mockGetLogger, onSpy, killSpy, runPackageScript}
}
