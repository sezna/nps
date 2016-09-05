import {resolve} from 'path'
import test from 'ava'
import colors from 'colors/safe'
import {spy} from 'sinon'
import proxyquire from 'proxyquire'
import {getScriptsAndArgs, help, preloadModule, loadConfig} from './index'

proxyquire.noCallThru()

test('getScriptsAndArgs: gets scripts', t => {
  const {scripts} = getScriptsAndArgs({
    args: ['boo'],
    rawArgs: ['node', 'nps', 'boo'],
  })
  t.deepEqual(scripts, ['boo'])
})

test('getScriptsAndArgs: gets scripts in series', t => {
  const {scripts, args} = getScriptsAndArgs({
    args: ['boo,bar'],
    rawArgs: ['node', 'nps', 'boo,bar'],
  })
  t.deepEqual(scripts, ['boo', 'bar'])
  t.deepEqual(args, '')
})

test('getScriptsAndArgs: gets parallel scripts', t => {
  const {scripts} = getScriptsAndArgs({
    parallel: 'boo,baz',
    rawArgs: ['node', 'nps', '-p', 'boo,baz'],
  })
  t.deepEqual(scripts, ['boo', 'baz'])
})

test('getScriptsAndArgs: passes args to scripts', t => {
  const {args, scripts} = getScriptsAndArgs({
    args: ['boo'],
    rawArgs: ['node', 'nps', 'boo', '--watch', '--verbose'],
  })
  t.deepEqual(scripts, ['boo'])
  t.is(args, '--watch --verbose')
})

test('getScriptsAndArgs: returns empty scripts and args if not parallel and no args', t => {
  const {args, scripts} = getScriptsAndArgs({
    args: [],
    rawArgs: ['node', 'nps'],
  })
  t.is(scripts.length, 0)
  t.is(args, '')
})

test('preloadModule: resolves a relative path', t => {
  const relativePath = './fixtures/my-module'
  const val = preloadModule(relativePath)
  t.is(val, 'hello')
})

test('preloadModule: resolves an absolute path', t => {
  const relativePath = './fixtures/my-module'
  const absolutePath = resolve(__dirname, relativePath)
  const val = preloadModule(absolutePath)
  t.is(val, 'hello')
})

test('preloadModule: resolves a node_module', t => {
  const val = preloadModule('colors/safe')
  t.is(val, colors)
})

test('preloadModule: logs a warning when the module cannot be required', t => {
  const warn = spy()
  const proxiedPreloadModule = proxyquire('./index', {
    '../get-logger': () => ({warn}),
  }).preloadModule
  const val = proxiedPreloadModule('./module-that-does-exist')
  t.is(val, undefined)
  t.true(warn.calledOnce)
  const [{message}] = warn.firstCall.args
  t.regex(message, /Unable to preload "\.\/module-that-does-exist"/)
})

test('loadConfig: logs a warning when the module cannot be required', t => {
  const error = spy()
  const proxiedReloadConfig = proxyquire('./index', {
    '../get-logger': () => ({error}),
  }).loadConfig
  const val = proxiedReloadConfig('./config-that-does-exist')
  t.is(val, undefined)
  t.true(error.calledOnce)
  const [{message}] = error.firstCall.args
  t.regex(message, /Unable to find config at "\.\/config-that-does-exist"/)
})

test('loadConfig: does not swallow syntax errors', t => {
  const relativePath = './fixtures/syntax-error-module'
  t.throws(() => loadConfig(relativePath), SyntaxError)
})

test('loadConfig: can load ES6 module', t => {
  const relativePath = './fixtures/fake-es6-module'
  const val = loadConfig(relativePath)
  t.deepEqual(val, {
    scripts: {
      skywalker: `echo "That's impossible!!"`,
    },
    options: {},
  })
})

test('help: formats a nice message', t => {
  const config = {
    scripts: {
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
  const expected = `
Available scripts (camel or kebab case accepted)

${colors.green('foo')} - ${colors.white('the foo script')} - ${colors.gray('echo "foo"')}
${colors.green('bar')} - ${colors.white('stuff')} - ${colors.gray('echo "bar default"')}
${colors.green('bar.baz')} - ${colors.gray('echo "baz"')}
${colors.green('bar.barBub')} - ${colors.gray('echo "barBub"')}
${colors.green('build')} - ${colors.gray('webpack')}
${colors.green('build.x')} - ${colors.white('webpack with x env')} - ${colors.gray('webpack --env.x')}
${colors.green('build.x.y')} - ${colors.white('build X-Y')} - ${colors.gray('echo "build x-y"')}
${colors.green('foobar')} - ${colors.gray('echo "foobar"')}
  `.trim()

  t.is(message, expected)
})

test('help: returns no scripts available', t => {
  const config = {scripts: {}}
  const message = help(config)
  const expected = colors.yellow('There are no scripts available')
  t.is(message, expected)
})
