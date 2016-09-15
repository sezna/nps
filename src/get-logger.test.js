/* eslint import/newline-after-import:0 global-require:0 */
import {spy} from 'sinon'

test('allows you to log errors', () => {
  const {log, console: {error}} = setup()
  log.error('hello', 'world')
  expect(error.calledOnce)
  expect(error.calledWith('hello', 'world'))
})

test('allows you to log warnings', () => {
  const {log, console: {warn}} = setup()
  log.warn('hello', 'world')
  expect(warn.calledOnce)
  expect(warn.calledWith('hello', 'world'))
})

test('allows you to log warnings/errors with a ref', () => {
  const {log, console: {warn}} = setup()
  const message = [`Han Solo is Kylo Ren's dad`, '😱']
  log.warn({
    message,
    ref: 'han-solo',
  }, 'this is extra', 'stuff')
  expect(warn.calledOnce)
  expect(warn.calledWith(
    ...message,
    'https://github.com/kentcdodds/p-s/blob/v0.0.0-semantically-released/other/ERRORS_AND_WARNINGS.md#han-solo',
    'this is extra',
    'stuff',
  ))
})

test('allows you to disable warnings', () => {
  const {LOG_LEVEL} = process.env
  process.env.LOG_LEVEL = 'disable'
  const {log, console: {warn}} = setup()
  log.warn('hi')
  expect(warn.called).toBe(false)
  process.env.LOG_LEVEL = LOG_LEVEL
})

test('allows you to disable errors', () => {
  const {LOG_LEVEL} = process.env
  process.env.LOG_LEVEL = 'disable'
  const {log, console: {error}} = setup()
  log.error('hi')
  expect(error.called).toBe(false)
  process.env.LOG_LEVEL = LOG_LEVEL
})

test('allows you to specify a logLevel of your own for errors/warnings/info', () => {
  const logLevel = 'info'
  const {log, console: {info}} = setup({logLevel})
  log.info('sup')
  expect(info.calledOnce)
  expect(info.calledWith('sup'))
})

function setup({mockConsole, logLevel} = {}) {
  mockConsole = getConsoleStub(mockConsole)
  jest.resetModules()
  jest.mock('console', () => mockConsole)
  const getLogger = require('./get-logger').default
  return {console: mockConsole, log: getLogger(logLevel)}
}

function getConsoleStub(overrides = {}) {
  return {
    error: spy(),
    warn: spy(),
    info: spy(),
    ...overrides,
  }
}
