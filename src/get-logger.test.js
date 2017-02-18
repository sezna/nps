/* eslint import/newline-after-import:0 global-require:0 */
import console from 'console'
import getLogger, {getLogLevel} from './get-logger'

jest.mock('console')

beforeEach(() => {
  delete process.env.LOG_LEVEL
  Object.keys(console).forEach(fn => {
    console[fn].mock && console[fn].mockClear()
  })
})

test('allows you to log errors', () => {
  const log = getLogger()
  log.error('hello', 'world')
  expect(console.error).toHaveBeenCalledTimes(1)
  expect(console.error).toHaveBeenCalledWith('hello', 'world')
})

test('allows you to log warnings', () => {
  const log = getLogger()
  log.warn('hello', 'world')
  expect(console.warn).toHaveBeenCalledTimes(1)
  expect(console.warn).toHaveBeenCalledWith('hello', 'world')
})

test('allows you to log warnings/errors with a ref', () => {
  const log = getLogger()
  const message = [`Han Solo is Kylo Ren's dad`, '😱']
  log.warn({
    message,
    ref: 'han-solo',
  }, 'this is extra', 'stuff')
  expect(console.warn).toHaveBeenCalledTimes(1)
  expect(console.warn).toHaveBeenCalledWith(
    ...message,
    'https://github.com/kentcdodds/nps/blob/v0.0.0-semantically-released/other/ERRORS_AND_WARNINGS.md#han-solo',
    'this is extra',
    'stuff',
  )
})

test('allows you to disable warnings', () => {
  const {LOG_LEVEL} = process.env
  process.env.LOG_LEVEL = 'disable'
  const log = getLogger()
  log.warn('hi')
  expect(console.warn).not.toHaveBeenCalled()
  process.env.LOG_LEVEL = LOG_LEVEL
})

test('allows you to disable errors', () => {
  const {LOG_LEVEL} = process.env
  process.env.LOG_LEVEL = 'disable'
  const log = getLogger()
  log.error('hi')
  expect(console.error).not.toHaveBeenCalled()
  process.env.LOG_LEVEL = LOG_LEVEL
})

test('allows you to specify a logLevel of your own for errors/warnings/info', () => {
  const logLevel = 'info'
  const log = getLogger(logLevel)
  log.info('sup')
  expect(console.info).toHaveBeenCalledTimes(1)
  expect(console.info).toHaveBeenCalledWith('sup')
})

test('getLogLevel: returns disable if silent', () => {
  expect(getLogLevel({silent: true})).toBe('disable')
})

test('getLogLevel: returns the log level if not silent', () => {
  expect(getLogLevel({logLevel: 'info'})).toBe('info')
})

test('getLogLevel: returns undefined if no logLevel and no silent', () => {
  expect(getLogLevel({})).toBe(undefined)
})
