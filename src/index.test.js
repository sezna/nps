import {resolve} from 'path'
import test from 'ava'
import {spy} from 'sinon'
import color from 'colors/safe'
import {clone} from 'lodash'
import managePath from 'manage-path'
import proxyquire from 'proxyquire'

proxyquire.noCallThru()

test('spawn called with the parent process.env + npm path', t => {
  const {options: {env}} = testSpawnCallWithDefaults(t)
  const copy = clone(process.env)
  managePath(copy).unshift(resolve('../node_modules/.bin'))
  t.deepEqual(env, copy)
})

test('does not blow up if there is no node_modules/.bin', t => {
  const {options: {env}} = testSpawnCallWithDefaults(t, undefined, {
    'find-up': {sync: () => null},
  })
  t.deepEqual(env, process.env)
})

test('spawn called with the expected command', t => {
  const lintCommand = 'eslint .'
  const {command} = testSpawnCall(t, {lint: lintCommand}, 'lint')
  t.is(command, lintCommand)
})

test('spawn.on called with "exit"', t => {
  const {onSpy} = testSpawnCallWithDefaults(t)
  t.true(onSpy.calledOnce)
})

test.cb('returns a log object when no script is found', t => {
  const {runPackageScript} = setup()
  const scriptConfig = {lint: {script: 42}}
  runPackageScript({scriptConfig, scripts: ['lint']}, ({error}) => {
    t.deepEqual(error, {
      message: color.red('Scripts must resolve to strings. There is no script that can be resolved from "lint"'),
      ref: 'missing-script',
    })
    t.end()
  })
})

test('options: silent sets the logLevel to disable', t => {
  const options = {silent: true}
  const {getLoggerSpy} = testSpawnCallWithDefaults(t, options)
  t.true(getLoggerSpy.calledOnce)
  t.true(getLoggerSpy.calledWith('disable'))
})

test('options: logLevel sets the log level', t => {
  const options = {logLevel: 'warn'}
  const {getLoggerSpy} = testSpawnCallWithDefaults(t, options)
  t.true(getLoggerSpy.calledOnce)
  t.true(getLoggerSpy.calledWith('warn'))
})

test('passes on additional arguments', t => {
  const lintCommand = 'eslint'
  const argsToPassOn = 'src/ scripts/'
  const {command} = testSpawnCall(t, {lint: lintCommand}, 'lint', {}, argsToPassOn)
  t.is(command, `${lintCommand} ${argsToPassOn}`)
})

test.cb('runs scripts in parallel if given an array of input', t => {
  const lintCommand = 'eslint'
  const buildCommand = 'babel'
  const args = 'src/ scripts/'
  const {runPackageScript, spawnStubSpy} = setup()
  const scripts = ['lint', 'build']
  const scriptConfig = {build: buildCommand, lint: lintCommand}
  runPackageScript({scriptConfig, scripts, args}, () => {
    t.true(spawnStubSpy.calledTwice)
    const [command1] = spawnStubSpy.firstCall.args
    const [command2] = spawnStubSpy.secondCall.args
    t.is(command1, 'eslint src/ scripts/')
    t.is(command2, 'babel src/ scripts/')
    t.end()
  })
})

test('runs the default script if no scripts provided', t => {
  const {command} = testSpawnCall(t, {default: 'echo foo'}, [])
  t.is(command, `echo foo`)
})

// util functions

function testSpawnCallWithDefaults(t, options, stubOverrides) {
  return testSpawnCall(t, undefined, undefined, options, undefined, stubOverrides)
}
function testSpawnCall(t, scriptConfig = {build: 'webpack'}, scripts = 'build', psOptions, args, stubOverrides) {
  /* eslint max-params:[2, 6] */ // TODO: refactor
  const {runPackageScript, spawnStubSpy, ...otherRet} = setup(stubOverrides)
  runPackageScript({scriptConfig, options: psOptions, scripts, args})
  t.true(spawnStubSpy.calledOnce)
  const [command, options] = spawnStubSpy.firstCall.args
  return {command, options, spawnStubSpy, ...otherRet}
}

function setup(stubOverrides = {}) {
  const onSpy = spy((event, cb) => cb())
  const spawnStub = () => ({on: onSpy}) // eslint-disable-line func-style
  const infoSpy = spy()
  const getLoggerSpy = spy(() => ({info: infoSpy}))
  const spawnStubSpy = spy(spawnStub)
  const runPackageScript = proxyquire('./index', {
    'spawn-command': spawnStubSpy,
    './get-logger': getLoggerSpy,
    ...stubOverrides,
  }).default
  return {spawnStubSpy, infoSpy, getLoggerSpy, onSpy, runPackageScript}
}
