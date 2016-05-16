import test from 'ava'
import {spy} from 'sinon'
import proxyquire from 'proxyquire'

test('allows you to log errors', t => {
  const {log, console: {error}} = setup()
  log.error('hello', 'world')
  t.true(error.calledOnce)
  t.true(error.calledWith('hello', 'world'))
})

test('allows you to log warnings', t => {
  const {log, console: {warn}} = setup()
  log.warn('hello', 'world')
  t.true(warn.calledOnce)
  t.true(warn.calledWith('hello', 'world'))
})

test('allows you to log warnings/errors with a ref', t => {
  const {log, console: {warn}} = setup()
  const message = [`Han Solo is Kylo Ren's dad`, '😱']
  log.warn({
    message,
    ref: 'han-solo',
  }, 'this is extra', 'stuff')
  t.true(warn.calledOnce)
  t.true(warn.calledWith(
    ...message,
    'https://github.com/kentcdodds/p-s/blob/v0.0.0-semantically-released/other/ERRORS_AND_WARNINGS.md#han-solo',
    'this is extra',
    'stuff',
  ))
})

test('allows you to disable warnings', t => {
  const {LOG_LEVEL} = process.env
  process.env.LOG_LEVEL = 'disable'
  const {log, console: {warn}} = setup()
  log.warn('hi')
  t.false(warn.called)
  process.env.LOG_LEVEL = LOG_LEVEL
})

test('allows you to disable errors', t => {
  const {LOG_LEVEL} = process.env
  process.env.LOG_LEVEL = 'disable'
  const {log, console: {error}} = setup()
  log.error('hi')
  t.false(error.called)
  process.env.LOG_LEVEL = LOG_LEVEL
})

test('allows you to specify a logLevel of your own for errors/warnings/info', t => {
  const logLevel = 'info'
  const {log, console: {info}} = setup({logLevel})
  log.info('sup')
  t.true(info.calledOnce)
  t.true(info.calledWith('sup'))
})

function setup({consoleStub, logLevel} = {}) {
  consoleStub = getConsoleStub(consoleStub)
  const getLogger = proxyquire('./get-logger', {
    console: consoleStub,
  }).default
  return {console: consoleStub, log: getLogger(logLevel)}
}

function getConsoleStub(overrides = {}) {
  return {
    error: spy(),
    warn: spy(),
    info: spy(),
    ...overrides,
  }
}
