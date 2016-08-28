import test from 'ava'
import {spy} from 'sinon'
import proxyquire from 'proxyquire'

test('inits omelette', t => {
  const {autocomplete, initSpy} = getAutocomplete()
  autocomplete()
  t.true(initSpy.calledOnce)
})

test('calls this.reply with the available scripts', t => {
  const stubConfig = {
    scripts: {
      build: {default: {script: 'build'}, watch: 'build.watch', main: {umd: 'build.main.umd', default: 'build.main'}},
      lint: {default: {script: 'lint', description: 'lint things'}, watch: 'lint.watch'},
      test: 'test',
      camelCase: 'camelCase',
      cover: {description: 'this is a description', script: 'this is the script'},
    },
  }
  const expectedReplyArgs = [
    'build', 'build.watch', 'build.main', 'build.main.umd',
    'lint', 'lint.watch',
    'test', 'camel-case', 'cover',
  ]
  const {autocomplete, getReplyArgs} = getAutocomplete()
  autocomplete(stubConfig)
  const actualReplyArgs = getReplyArgs()
  t.deepEqual(actualReplyArgs, expectedReplyArgs)
})

test('install calls setupShellInitFile with the given destination', t => {
  const {install, setupShellInitFileSpy} = getInstall()
  const destination = '~/.my_bash_profile'
  install(destination)
  const [actualDestination] = setupShellInitFileSpy.firstCall.args
  t.true(setupShellInitFileSpy.calledOnce)
  t.is(actualDestination, destination)
})

function getAutocomplete() {
  const onSpy = spy()
  const initSpy = spy()
  const omelette = spy(() => {
    return {on: onSpy, init: initSpy}
  })
  const autocomplete = proxyquire('./index', {omelette}).default
  return {autocomplete, getReplyArgs, initSpy}

  function getReplyArgs() {
    const [, replier] = onSpy.firstCall.args
    const reply = spy()
    const context = {reply}
    replier.call(context)
    return reply.firstCall.args[0]
  }
}

function getInstall() {
  const setupShellInitFileSpy = spy()
  const omelette = spy(() => ({setupShellInitFile: setupShellInitFileSpy}))
  const {install} = proxyquire('./index', {omelette})
  return {install, setupShellInitFileSpy}
}
