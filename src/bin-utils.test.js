import test from 'ava'
import {getScriptsAndArgs} from './bin-utils'

test('gets scripts', t => {
  const {scripts} = getScriptsAndArgs({
    args: ['boo'],
    rawArgs: ['node', 'p-s', 'boo'],
  })
  t.deepEqual(scripts, ['boo'])
})

test('gets parallel scripts', t => {
  const {scripts} = getScriptsAndArgs({
    parallel: 'boo,baz',
    rawArgs: ['node', 'p-s', '-p', 'boo,baz'],
  })
  t.deepEqual(scripts, ['boo', 'baz'])
})

test('passes args to scripts', t => {
  const {args, scripts} = getScriptsAndArgs({
    args: ['boo'],
    rawArgs: ['node', 'p-s', 'boo', '--watch', '--verbose'],
  })
  t.deepEqual(scripts, ['boo'])
  t.is(args, '--watch --verbose')
})
