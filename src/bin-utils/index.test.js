/* eslint import/newline-after-import:0, global-require:0 */
import path from 'path'
import chalk from 'chalk'
import {spy} from 'sinon'
import {oneLine} from 'common-tags'
import {help, preloadModule, loadConfig} from './index'

test('preloadModule: resolves a relative path', () => {
  // this is relative to process.cwd() I think...
  // Because of some fancy stuff that Jest does with requires...
  const relativePath = './src/bin-utils/fixtures/my-module'
  const val = preloadModule(relativePath)
  expect(val).toBe('hello')
})

test('preloadModule: resolves an absolute path', () => {
  const absolutePath = getAbsoluteFixturePath('my-module')
  const val = preloadModule(absolutePath)
  expect(val).toBe('hello')
})

test('preloadModule: resolves a node_module', () => {
  const val = preloadModule('chalk')
  expect(val).toBe(chalk)
})

test('preloadModule: logs a warning when the module cannot be required', () => {
  const mockWarn = spy()
  jest.resetModules()
  jest.mock('../get-logger', () => () => ({warn: mockWarn}))
  const {preloadModule: proxiedPreloadModule} = require('./index')
  const val = proxiedPreloadModule('./module-that-does-exist')
  expect(val).toBeUndefined()
  expect(mockWarn.calledOnce).toBe(true)
  const [{message}] = mockWarn.firstCall.args
  expect(message).toMatch(/Unable to preload "\.\/module-that-does-exist"/)
})

test('loadConfig: calls the config function if it is a function', () => {
  jest.resetModules()
  const {loadConfig: proxiedLoadConfig} = require('./index')
  const val = proxiedLoadConfig(getAbsoluteFixturePath('function-config.js'))
  expect(val).toEqual({
    scripts: {
      functionConfig: 'echo worked!',
    },
  })
})

test(
  oneLine`
    loadConfig: logs and throws an error
    for a config that exports the wrong data type
  `,
  () => {
    const mockError = jest.fn()
    jest.resetModules()
    jest.mock('../get-logger', () => () => ({error: mockError}))
    const {loadConfig: proxiedLoadConfig} = require('./index')
    const fixturePath = getAbsoluteFixturePath('bad-data-type-config.js')
    expect(() => proxiedLoadConfig(fixturePath)).toThrowError(
      /Your config.*string/,
    )
    expect(mockError).toHaveBeenCalledTimes(1)
    expect(mockError).toHaveBeenCalledWith({
      message: expect.stringMatching(fixturePath),
      ref: 'config-must-be-an-object',
    })
  },
)

test(
  oneLine`
    loadConfig: logs and throws an error for a
    config that exports a function that returns
    the wrong data type
  `,
  () => {
    const mockError = jest.fn()
    jest.resetModules()
    jest.mock('../get-logger', () => () => ({error: mockError}))
    const {loadConfig: proxiedLoadConfig} = require('./index')
    const fixturePath = getAbsoluteFixturePath(
      'bad-function-data-type-config.js',
    )
    expect(() => proxiedLoadConfig(fixturePath)).toThrowError(
      /Your config.*function.*Array/,
    )
    expect(mockError).toHaveBeenCalledTimes(1)
    expect(mockError).toHaveBeenCalledWith({
      message: expect.stringMatching(fixturePath),
      ref: 'config-must-be-an-object',
    })
  },
)

test('loadConfig: logs a warning when the JS module cannot be required', () => {
  const mockError = spy()
  jest.resetModules()
  jest.mock('../get-logger', () => () => ({error: mockError}))
  const {loadConfig: proxiedReloadConfig} = require('./index')
  const val = proxiedReloadConfig('./config-that-does-exist')
  expect(val).toBeUndefined()
  expect(mockError.calledOnce)
  const [{message}] = mockError.firstCall.args
  expect(message).toMatch(
    /Unable to find JS config at "\.\/config-that-does-exist"/,
  )
})

test('loadConfig: does not swallow JS syntax errors', () => {
  const originalCwd = process.cwd
  process.cwd = jest.fn(() => path.resolve(__dirname, '../..'))
  const relativePath = './src/bin-utils/fixtures/syntax-error-module'
  expect(() => loadConfig(relativePath)).toThrowError()
  process.cwd = originalCwd
})

test('loadConfig: can load ES6 module', () => {
  const relativePath = './src/bin-utils/fixtures/fake-es6-module'
  const val = loadConfig(relativePath)
  expect(val).toEqual({
    scripts: {
      skywalker: `echo "That's impossible!!"`,
    },
    options: {},
  })
})

test('loadConfig: does not swallow YAML syntax errors', () => {
  const originalCwd = process.cwd
  process.cwd = jest.fn(() => path.resolve(__dirname, '../..'))
  const relativePath = './src/bin-utils/fixtures/syntax-error-config.yml'
  expect(() => loadConfig(relativePath)).toThrowError()
  process.cwd = originalCwd
})

test('loadConfig: logs a warning when the YAML file cannot be located', () => {
  const mockError = spy()
  jest.resetModules()
  jest.mock('../get-logger', () => () => ({error: mockError}))
  const {loadConfig: proxiedReloadConfig} = require('./index')
  const val = proxiedReloadConfig('./config-that-does-not-exist.yml')
  expect(val).toBeUndefined()
  expect(mockError.calledOnce)
  const [{message}] = mockError.firstCall.args
  expect(message).toMatch(
    /Unable to find YML config at "\.\/config-that-does-not-exist.yml"/,
  )
})

test('loadConfig: can load config from YML file', () => {
  const relativePath = './src/bin-utils/fixtures/fake-config.yml'
  const val = loadConfig(relativePath)
  expect(val).toEqual({
    scripts: {
      skywalker: `echo "That's impossible!!"`,
    },
    options: {},
  })
})

test('help: formats a nice message', () => {
  const config = {
    scripts: {
      default: {
        description: 'the default script',
        script: 'echo "default"',
      },
      foo: {
        description: 'the foo script',
        script: 'echo "foo"',
      },
      bar: {
        default: {
          description: 'stuff',
          script: 'echo "bar default"',
        },
        baz: 'echo "baz"',
        barBub: {
          script: 'echo "barBub"',
        },
      },
      build: {
        default: 'webpack',
        x: {
          default: {
            script: 'webpack --env.x',
            description: 'webpack with x env',
          },
          y: {
            description: 'build X-Y',
            script: 'echo "build x-y"',
          },
        },
      },
      foobar: 'echo "foobar"',
      extra: 42,
    },
  }

  const message = help(config)
  // normally I'd use snapshot testing
  // but the colors here are easier to think about
  // than `[32mfoobar[39m` sooo....
  const expected = `
Available scripts (camel or kebab case accepted)

${chalk.green('default')} - ${chalk.white('the default script')} - ${chalk.gray('echo "default"')}
${chalk.green('foo')} - ${chalk.white('the foo script')} - ${chalk.gray('echo "foo"')}
${chalk.green('bar')} - ${chalk.white('stuff')} - ${chalk.gray('echo "bar default"')}
${chalk.green('bar.baz')} - ${chalk.gray('echo "baz"')}
${chalk.green('bar.barBub')} - ${chalk.gray('echo "barBub"')}
${chalk.green('build')} - ${chalk.gray('webpack')}
${chalk.green('build.x')} - ${chalk.white('webpack with x env')} - ${chalk.gray('webpack --env.x')}
${chalk.green('build.x.y')} - ${chalk.white('build X-Y')} - ${chalk.gray('echo "build x-y"')}
${chalk.green('foobar')} - ${chalk.gray('echo "foobar"')}
`.trim()

  expect(message).toBe(expected)
})

test('help: returns no scripts available', () => {
  const config = {scripts: {}}
  const message = help(config)
  const expected = chalk.yellow('There are no scripts available')
  expect(message).toBe(expected)
})

test('help: do not display scripts with flag hiddenFromHelp set to true', () => {
  const config = {
    scripts: {
      foo: {
        description: 'the foo script',
        script: 'echo "foo"',
        hiddenFromHelp: true,
      },
    },
  }
  const message = help(config)
  const expected = chalk.yellow('There are no scripts available')
  expect(message).toBe(expected)
})

function getAbsoluteFixturePath(fixture) {
  return path.join(__dirname, 'fixtures', fixture)
}
