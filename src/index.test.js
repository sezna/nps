import test from 'ava'
import {spy} from 'sinon'
import runPackageScript from './index'

test('spawn called with the parent process.env', t => {
  const {options: {env}} = testSpawnCallWithDefaults(t)
  t.is(env, process.env)
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

test.cb('throws when the script is not a string', t => {
  rewireDeps()
  const scriptConfig = {lint: {script: 42}}
  runPackageScript({scriptConfig, scripts: ['lint']}, ({error}) => {
    if (!error || !(error instanceof Error) || error.message !== 'scripts must resolve to strings') {
      t.end('Error is not the expected error: ' + JSON.stringify(error))
    }
    t.end()
  })
})

test('options: silent disables console output', t => {
  const options = {silent: true}
  const {consoleStub} = testSpawnCallWithDefaults(t, options)
  t.false(consoleStub.log.called)
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
  const {spawnStubSpy} = rewireDeps()
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
  return testSpawnCall(t, undefined, undefined, options)
}
function testSpawnCall(t, scriptConfig = {build: 'webpack'}, scripts = 'build', psOptions, args) {
  const {spawnStubSpy, ...otherRet} = rewireDeps()
  runPackageScript({scriptConfig, options: psOptions, scripts, args})
  t.true(spawnStubSpy.calledOnce)
  const [command, options] = spawnStubSpy.firstCall.args
  return {command, options, spawnStubSpy, ...otherRet}
}

function rewireDeps() {
  const onSpy = spy((event, cb) => cb())
  // const logSpy = spy(function log() {console.log(...arguments)}) // comment this back in while debugging
  const logSpy = spy()
  const spawnStub = () => ({on: onSpy}) // eslint-disable-line func-style
  const consoleStub = {log: logSpy}
  const spawnStubSpy = spy(spawnStub)
  runPackageScript.__Rewire__('spawn', spawnStubSpy)
  runPackageScript.__Rewire__('console', consoleStub)
  return {spawnStubSpy, consoleStub, onSpy}
}
