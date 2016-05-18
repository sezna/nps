import test from 'ava'
import {spy} from 'sinon'
import color from 'colors/safe'
import proxyquire from 'proxyquire'
import assign from 'lodash.assign'
proxyquire.noCallThru()

test('spawn called with the parent process.env', t => {
  const {options: {env}} = testSpawnCallWithDefaults(t)
  t.deepEqual(env, process.env)
})

test('spawn called with the expected command', t => {
  const lintCommand = 'eslint .'
  const {command} = testSpawnCall(t, {scriptConfig: {lint: lintCommand}, scripts: 'lint'})
  t.is(command, lintCommand)
})

test('spawn called with the expected command and env vars', t => {
  const lintCommand = 'eslint .'
  const {command, options: {env}} = testSpawnCall(t, {
    scriptConfig: {lint: lintCommand},
    envConfig: {lint: {foo: 'bar'}},
    scripts: 'lint',
  })
  t.is(command, lintCommand)
  t.deepEqual(env, assign({}, process.env, {foo: 'bar'}))
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
  const {command} = testSpawnCall(t, {
    scriptConfig: {lint: lintCommand},
    scripts: 'lint',
    psOptions: {},
    args: argsToPassOn,
  })
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

// util functions

function testSpawnCallWithDefaults(t, options) {
  return testSpawnCall(t, {psOptions: options})
}
function testSpawnCall(t, {scriptConfig = {build: 'webpack'}, envConfig, scripts = 'build', psOptions, args}) {
  const {runPackageScript, spawnStubSpy, ...otherRet} = setup()
  runPackageScript({scriptConfig, envConfig, options: psOptions, scripts, args})
  t.true(spawnStubSpy.calledOnce)
  const [command, options] = spawnStubSpy.firstCall.args
  return {command, options, spawnStubSpy, ...otherRet}
}

function setup() {
  const onSpy = spy((event, cb) => cb())
  const spawnStub = () => ({on: onSpy}) // eslint-disable-line func-style
  const infoSpy = spy()
  const getLoggerSpy = spy(() => ({info: infoSpy}))
  const spawnStubSpy = spy(spawnStub)
  const runPackageScript = proxyquire('./index', {
    'spawn-command': spawnStubSpy,
    './get-logger': getLoggerSpy,
  }).default
  return {spawnStubSpy, infoSpy, getLoggerSpy, onSpy, runPackageScript}
}
