import test from 'ava'
import {spy} from 'sinon'
import merge from 'lodash.merge'
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
    'https://github.com/kentcdodds/p-s/blob/0.0.0-semantically-released/other/ERRORS_AND_WARNINGS.md#han-solo',
    'this is extra',
    'stuff',
  ))
})

test('allows you to disable warnings', t => {
  const processStub = {env: {LOG_LEVEL: 'disable'}}
  const {log, console: {warn}} = setup({processStub})
  log.warn('hi')
  t.false(warn.called)
})

test('allows you to disable errors', t => {
  const processStub = {env: {LOG_LEVEL: 'warn'}}
  const {log, console: {error}} = setup({processStub})
  log.error('hi')
  t.false(error.called)
})

test('allows you to specify a logLevel of your own for errors/warnings/info', t => {
  const logLevel = 'info'
  const {log, console: {info}} = setup({logLevel})
  log.info('sup')
  t.true(info.calledOnce)
  t.true(info.calledWith('sup'))
})

function setup({consoleStub, processStub, logLevel} = {}) {
  consoleStub = getConsoleStub(consoleStub)
  processStub = getProcessStub(processStub)
  const getLogger = proxyquire('./get-logger', {
    console: consoleStub,
    process: processStub,
  }).default
  return {console: consoleStub, process: processStub, log: getLogger(logLevel)}
}

function getConsoleStub(overrides = {}) {
  return {
    error: spy(),
    warn: spy(),
    info: spy(),
    ...overrides,
  }
}

function getProcessStub(overrides = {}) {
  return merge({
    env: {LOG_LEVEL: undefined},
  }, overrides)
}
