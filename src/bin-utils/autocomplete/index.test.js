/* eslint global-require:0, import/newline-after-import:0 */
import {spy} from 'sinon'

test('inits omelette', () => {
  const {autocomplete, mockInit} = getAutocomplete()
  autocomplete()
  expect(mockInit.calledOnce)
})

test('calls this.reply with the available scripts', () => {
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
  expect(actualReplyArgs).toEqual(expectedReplyArgs)
})

test('install calls setupShellInitFile with the given destination', () => {
  const {install, mockSetupShellInitFile} = getInstall()
  const destination = '~/.my_bash_profile'
  install(destination)
  const [actualDestination] = mockSetupShellInitFile.firstCall.args
  expect(mockSetupShellInitFile.calledOnce)
  expect(actualDestination).toBe(destination)
})

function getAutocomplete() {
  const mockOn = spy()
  const mockInit = spy()
  jest.resetModules()
  jest.mock('omelette', () => () => {
    return {on: mockOn, init: mockInit}
  })
  const autocomplete = require('./index').default
  return {autocomplete, getReplyArgs, mockInit}

  function getReplyArgs() {
    const [, replier] = mockOn.firstCall.args
    const reply = spy()
    const context = {reply}
    replier.call(context)
    return reply.firstCall.args[0]
  }
}

function getInstall() {
  const mockSetupShellInitFile = spy()
  jest.resetModules()
  jest.mock('omelette', () => () => {
    return {setupShellInitFile: mockSetupShellInitFile}
  })
  const {install} = require('./index')
  return {install, mockSetupShellInitFile}
}
