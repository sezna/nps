/* eslint import/newline-after-import:0, global-require:0 */
import {oneLine} from 'common-tags'
import chalk from 'chalk'
import managePath from 'manage-path'

test('spawn called with the parent process.env + npm path', () => {
  return testSpawnCallWithDefaults().then(({options: {env}}) => {
    const path = managePath(env).get()
    expect(path).toContain('path/to/package-scripts.js')
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

test('spawn called and appends options', () => {
  const testCommand = 'jest'
  return testSpawnCall({test: testCommand}, [
    'test',
    '--',
    '--watch',
  ]).then(({command}) => {
    expect(command).toBe(`${testCommand} --watch`)
  })
})

test('spawn called and appends options to default', () => {
  const testCommand = 'jest'
  return testSpawnCall({default: testCommand}, [
    '--',
    '--watch',
  ]).then(({command}) => {
    expect(command).toBe(`${testCommand} --watch`)
  })
})

test('spawn.on called with "close" and "error"', () => {
  return testSpawnCallWithDefaults().then(({onSpy}) => {
    expect(onSpy).toHaveBeenCalledTimes(2)
    const [[arg1], [arg2]] = onSpy.mock.calls
    expect(arg1).toEqual('error')
    expect(arg2).toEqual('close')
  })
})

test('returns a log object when no script is found', () => {
  const {runPackageScript} = setup()
  const scriptConfig = {lint: {script: 42}}
  return runPackageScript({scriptConfig, scripts: ['lint']}).catch(error => {
    expect(error).toEqual({
      message: chalk.red(
        oneLine`
          Scripts must resolve to strings.
          There is no script that can be
          resolved from "lint"
        `,
      ),
      ref: 'missing-script',
    })
  })
})

test('options: silent sets the logLevel to disable', () => {
  const options = {silent: true}
  return testSpawnCallWithDefaults(options).then(({mockGetLogger}) => {
    expect(mockGetLogger).toHaveBeenCalledTimes(1)
    expect(mockGetLogger).toHaveBeenCalledWith('disable')
  })
})

test('options: logLevel sets the log level', () => {
  const options = {logLevel: 'warn'}
  return testSpawnCallWithDefaults(options).then(({mockGetLogger}) => {
    expect(mockGetLogger).toHaveBeenCalledTimes(1)
    expect(mockGetLogger).toHaveBeenCalledWith('warn')
  })
})

test('options: scripts logs command text', async() => {
  const {runPackageScript, infoSpy} = setup()
  const scriptConfig = {test: {script: 'echo test'}}
  const options = {scripts: true}
  await runPackageScript({
    scriptConfig,
    scripts: ['test'],
    options,
  })
  expect(infoSpy).toHaveBeenCalledTimes(1)
  expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(/echo test/))
})

test('options: scripts does not log command text when false', async() => {
  const {runPackageScript, infoSpy} = setup()
  const scriptConfig = {test: {script: 'echo test'}}
  const options = {scripts: false}
  await runPackageScript({
    scriptConfig,
    scripts: ['test'],
    options,
  })
  expect(infoSpy).toHaveBeenCalledTimes(1)
  expect(infoSpy).not.toHaveBeenCalledWith(expect.stringMatching(/echo test/))
})

test('runs scripts serially if given an array of input', () => {
  const lintCommand = 'eslint'
  const buildCommand = 'babel'
  const {runPackageScript, mockSpawnStubSpy} = setup()
  const scripts = ['lint src/ scripts/', 'build src/ scripts/']
  const scriptConfig = {build: buildCommand, lint: lintCommand}
  const options = {}
  return runPackageScript({scriptConfig, scripts, options}).then(() => {
    expect(mockSpawnStubSpy).toHaveBeenCalledTimes(2)
    const [[command1], [command2]] = mockSpawnStubSpy.mock.calls
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
      kill() {},
    }
  }
  const mockSpawnStubSpy = jest.fn(spawnStub)
  const {runPackageScript} = setup(mockSpawnStubSpy)
  return runPackageScript({scriptConfig, scripts}).then(
    () => {
      throw new Error('the promise should be rejected')
    },
    ({message, ref, code}) => {
      expect(code).toBe(FAIL_CODE)
      expect(typeof ref === 'string').toBe(true)
      expect(typeof message === 'string').toBe(true)
      // only called with the bad script, not for the good one
      expect(mockSpawnStubSpy).toHaveBeenCalledTimes(1)
      const [[command1]] = mockSpawnStubSpy.mock.calls
      expect(command1).toBe(badCommand)
    },
  )
})

test('runs the default script if no scripts provided', () => {
  return testSpawnCall({default: 'echo foo'}, []).then(({command}) => {
    expect(command).toBe(`echo foo`)
  })
})

test('returns a log object when a script does not exist', () => {
  const {runPackageScript} = setup()
  const scriptConfig = {lint: {script: 42}}
  return runPackageScript({scriptConfig, scripts: ['dev']}).catch(error => {
    expect(error).toEqual({
      message: chalk.red(
        oneLine`
          Scripts must resolve to strings.
          There is no script that can be
          resolved from "dev"
        `,
      ),
      ref: 'missing-script',
    })
  })
})

test('an error from the child process logs an error', () => {
  const ERROR = {message: 'there was an error', code: 2}
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
        if (event === 'error' && cmd === badCommand) {
          cb(ERROR)
        }
      },
      kill() {},
    }
  }
  const mockSpawnStubSpy = jest.fn(spawnStub)
  const {runPackageScript} = setup(mockSpawnStubSpy)
  return runPackageScript({scriptConfig, scripts}).then(
    () => {
      throw new Error('the promise should be rejected')
    },
    ({message, ref, error}) => {
      expect(error).toBe(ERROR)
      expect(typeof ref).toBe('string')
      expect(typeof message).toBe('string')
      expect(mockSpawnStubSpy).toHaveBeenCalledTimes(1)
      const [[command1]] = mockSpawnStubSpy.mock.calls
      expect(command1).toBe(badCommand)
    },
  )
})

// util functions

function testSpawnCallWithDefaults(options) {
  return testSpawnCall(undefined, undefined, options)
}
function testSpawnCall(
  scriptConfig = {build: 'webpack'},
  scripts = 'build',
  psOptions,
) {
  /* eslint max-params:[2, 6] */ // TODO: refactor
  const {runPackageScript, mockSpawnStubSpy, ...otherRet} = setup()
  return runPackageScript({
    scriptConfig,
    options: psOptions,
    scripts,
  }).then(
    result => {
      expect(mockSpawnStubSpy).toHaveBeenCalledTimes(1)
      const [[command, options]] = mockSpawnStubSpy.mock.calls
      return Promise.resolve({
        result,
        command,
        options,
        mockSpawnStubSpy,
        ...otherRet,
      })
    },
    error => {
      expect(mockSpawnStubSpy).toHaveBeenCalledTimes(1)
      const [[command, options]] = mockSpawnStubSpy.mock.calls
      return Promise.reject({
        error,
        command,
        options,
        mockSpawnStubSpy,
        ...otherRet,
      })
    },
  )
}

function setup(mockSpawnStubSpy) {
  const onSpy = jest.fn((event, cb) => {
    if (event === 'close') {
      cb(0)
    }
  })
  const infoSpy = jest.fn()
  const mockGetLogger = jest.fn(() => ({info: infoSpy}))
  mockGetLogger.getLogLevel = require.requireActual(
    '../get-logger',
  ).getLogLevel
  mockSpawnStubSpy = mockSpawnStubSpy || jest.fn(spawnStub)
  jest.resetModules()
  jest.mock('spawn-command-with-kill', () => mockSpawnStubSpy)
  jest.mock('../get-logger', () => mockGetLogger)
  const runPackageScript = require('../').default
  return {
    mockSpawnStubSpy,
    infoSpy,
    mockGetLogger,
    onSpy,
    runPackageScript,
  }
  function spawnStub() {
    return {on: onSpy, kill() {}}
  }
}
