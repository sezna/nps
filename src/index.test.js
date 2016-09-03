import {resolve} from 'path'
import Promise from 'bluebird'
import test from 'ava'
import {spy} from 'sinon'
import color from 'colors/safe'
import {clone} from 'lodash'
import managePath from 'manage-path'
import proxyquire from 'proxyquire'

proxyquire.noCallThru()

test('spawn called with the parent process.env + npm path', t => {
  return testSpawnCallWithDefaults(t).then(({options: {env}}) => {
    const copy = clone(process.env)
    managePath(copy).unshift(resolve('../node_modules/.bin'))
    t.deepEqual(env, copy)
  })
})

test('does not blow up if there is no node_modules/.bin', t => {
  return testSpawnCallWithDefaults(t, undefined, {
    'find-up': {sync: () => null},
  }).then(({options: {env}}) => {
    t.deepEqual(env, process.env)
  })
})

test('spawn called with the expected command', t => {
  const lintCommand = 'eslint .'
  return testSpawnCall(t, {lint: lintCommand}, 'lint').then(({command}) => {
    t.is(command, lintCommand)
  })
})

test('spawn.on called with "close" and "error"', t => {
  return testSpawnCallWithDefaults(t).then(({onSpy}) => {
    t.true(onSpy.calledTwice)
    t.true(onSpy.calledWith('close'))
    t.true(onSpy.calledWith('error'))
  })
})

test('returns a log object when no script is found', t => {
  const {runPackageScript} = setup()
  const scriptConfig = {lint: {script: 42}}
  return runPackageScript({scriptConfig, scripts: ['lint']}).catch(error => {
    t.deepEqual(error, {
      message: color.red('Scripts must resolve to strings. There is no script that can be resolved from "lint"'),
      ref: 'missing-script',
    })
  })
})

test('options: silent sets the logLevel to disable', t => {
  const options = {silent: true}
  return testSpawnCallWithDefaults(t, options).then(({getLoggerSpy}) => {
    t.true(getLoggerSpy.calledOnce)
    t.true(getLoggerSpy.calledWith('disable'))
  })
})

test('options: logLevel sets the log level', t => {
  const options = {logLevel: 'warn'}
  return testSpawnCallWithDefaults(t, options).then(({getLoggerSpy}) => {
    t.true(getLoggerSpy.calledOnce)
    t.true(getLoggerSpy.calledWith('warn'))
  })
})

test('passes on additional arguments', t => {
  const lintCommand = 'eslint'
  const argsToPassOn = 'src/ scripts/'
  return testSpawnCall(t, {lint: lintCommand}, 'lint', {}, argsToPassOn).then(({command}) => {
    t.is(command, `${lintCommand} ${argsToPassOn}`)
  })
})

test('runs scripts serially if given an array of input without parallel', t => {
  const lintCommand = 'eslint'
  const buildCommand = 'babel'
  const args = 'src/ scripts/'
  const resolveSpy = spy(Promise, 'resolve')
  const {runPackageScript, spawnStubSpy} = setup({
    bluebird: Promise,
  })
  const scripts = ['lint', 'build']
  const scriptConfig = {build: buildCommand, lint: lintCommand}
  const options = {}
  runPackageScript({scriptConfig, scripts, args, options}).then(() => {
    t.true(resolveSpy.calledOnce)
    t.true(spawnStubSpy.calledTwice)
    const [command1] = spawnStubSpy.firstCall.args
    const [command2] = spawnStubSpy.secondCall.args
    t.is(command1, 'eslint src/ scripts/')
    t.is(command2, 'babel src/ scripts/')
  })
})

test('stops running scripts when running serially if any given script fails', t => {
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
  const spawnStubSpy = spy(spawnStub)
  const {runPackageScript} = setup({
    'spawn-command-with-kill': spawnStubSpy,
  })
  return runPackageScript({scriptConfig, scripts}).then(() => {
    t.fail('the promise should be rejected')
  }, ({message, ref, code}) => {
    t.is(code, FAIL_CODE)
    t.true(typeof ref === 'string')
    t.true(typeof message === 'string')
    t.true(spawnStubSpy.calledOnce) // only called with the bad script, not for the good one
    const [command1] = spawnStubSpy.firstCall.args
    t.is(command1, 'bad')
  })
})

test('runs scripts in parallel if given an array of input', t => {
  const lintCommand = 'eslint'
  const buildCommand = 'babel'
  const args = 'src/ scripts/'
  const {runPackageScript, spawnStubSpy} = setup()
  const scripts = ['lint', 'build']
  const scriptConfig = {build: buildCommand, lint: lintCommand}
  const options = {parallel: true}
  return runPackageScript({scriptConfig, scripts, args, options}).then(() => {
    t.true(spawnStubSpy.calledTwice)
    const [command1] = spawnStubSpy.firstCall.args
    const [command2] = spawnStubSpy.secondCall.args
    t.is(command1, 'eslint src/ scripts/')
    t.is(command2, 'babel src/ scripts/')
  })
})

test('runs the default script if no scripts provided', t => {
  return testSpawnCall(t, {default: 'echo foo'}, []).then(({command}) => {
    t.is(command, `echo foo`)
  })
})

test('an non-zero exit code from a script will abort other scripts that are still running', t => {
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
  const {runPackageScript} = setup({
    'spawn-command-with-kill': spawnStub,
  })
  const options = {parallel: true}
  return runPackageScript({scriptConfig, scripts, options}).then(() => {
    t.fail('the promise should be rejected')
  }, ({code, ref, message}) => {
    t.is(code, FAIL_CODE)
    t.true(typeof ref === 'string')
    t.true(typeof message === 'string')
    t.true(killSpy.calledOnce) // and only once, just for the longCommand
    t.is(killSpy.firstCall.args[0], longCommand)
  })
})

test('an error event from a script will abort other scripts', t => {
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
  const {runPackageScript} = setup({
    'spawn-command-with-kill': spawnStub,
  })
  const options = {parallel: true}
  return runPackageScript({scriptConfig, scripts, options}).then(() => {
    t.fail('the promise should be rejected')
  }, ({error, ref, message}) => {
    t.is(error, ERROR_STRING)
    t.true(typeof ref === 'string')
    t.true(typeof message === 'string')
    t.true(killSpy.calledOnce) // and only once, just for the longCommand
    t.is(killSpy.firstCall.args[0], longCommand)
  })
})

// util functions

function testSpawnCallWithDefaults(t, options, stubOverrides) {
  return testSpawnCall(t, undefined, undefined, options, undefined, stubOverrides)
}
function testSpawnCall(t, scriptConfig = {build: 'webpack'}, scripts = 'build', psOptions, args, stubOverrides) {
  /* eslint max-params:[2, 6] */ // TODO: refactor
  const {runPackageScript, spawnStubSpy, ...otherRet} = setup(stubOverrides)
  return runPackageScript({scriptConfig, options: psOptions, scripts, args})
    .then(result => {
      t.true(spawnStubSpy.calledOnce)
      const [command, options] = spawnStubSpy.firstCall.args
      return Promise.resolve({result, command, options, spawnStubSpy, ...otherRet})
    }, error => {
      t.true(spawnStubSpy.calledOnce)
      const [command, options] = spawnStubSpy.firstCall.args
      return Promise.reject({error, command, options, spawnStubSpy, ...otherRet})
    })
}

function setup(
  stubOverrides = {},
  onSpy = spy((event, cb) => {
    if (event === 'close') {
      cb(0)
    }
  })
) {
  const killSpy = spy()
  const spawnStub = () => ({on: onSpy, kill: killSpy}) // eslint-disable-line func-style
  const infoSpy = spy()
  const getLoggerSpy = spy(() => ({info: infoSpy}))
  const spawnStubSpy = spy(spawnStub)
  const runPackageScript = proxyquire('./index', {
    'spawn-command-with-kill': spawnStubSpy,
    './get-logger': getLoggerSpy,
    ...stubOverrides,
  }).default
  return {spawnStubSpy, infoSpy, getLoggerSpy, onSpy, killSpy, runPackageScript}
}
