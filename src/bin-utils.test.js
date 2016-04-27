import test from 'ava'
import colors from 'colors/safe'
import {getScriptsAndArgs, help} from './bin-utils'

test('getScriptsAndArgs: gets scripts', t => {
  const {scripts} = getScriptsAndArgs({
    args: ['boo'],
    rawArgs: ['node', 'p-s', 'boo'],
  })
  t.deepEqual(scripts, ['boo'])
})

test('getScriptsAndArgs: gets parallel scripts', t => {
  const {scripts} = getScriptsAndArgs({
    parallel: 'boo,baz',
    rawArgs: ['node', 'p-s', '-p', 'boo,baz'],
  })
  t.deepEqual(scripts, ['boo', 'baz'])
})

test('getScriptsAndArgs: passes args to scripts', t => {
  const {args, scripts} = getScriptsAndArgs({
    args: ['boo'],
    rawArgs: ['node', 'p-s', 'boo', '--watch', '--verbose'],
  })
  t.deepEqual(scripts, ['boo'])
  t.is(args, '--watch --verbose')
})

test('help: formats a nice message', t => {
  const config = {
    scripts: {
      foo: {
        description: 'the foo script',
        script: 'echo \"foo\"',
      },
      bar: {
        default: {
          description: 'stuff',
          script: 'echo \"bar default\"',
        },
        baz: 'echo \"baz\"',
        barBub: {
          script: 'echo \"barBub\"',
        },
      },
      foobar: 'echo \"foobar\"',
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
