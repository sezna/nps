import test from 'ava'
import getScriptEnv from './get-script-env'

test('works with a nonexistent config', t => {
  const env = getScriptEnv(undefined, 'wat')
  t.deepEqual(env, {})
})

test('allows a prefix to be provided', t => {
  const env = getScriptEnv({build: {foo: 'bar'}}, 'b')
  t.deepEqual(env, {foo: 'bar'})
})

test('allows a multi-level prefix to be provided', t => {
  const env = getScriptEnv({build: {watch: {baz: 'qux'}}}, 'b.w')
  t.deepEqual(env, {baz: 'qux'})
})

test('falls back to using `get` for the full name if no prefix is provided', t => {
  const env = getScriptEnv({build: {watch: {foo: 'bar'}}}, 'build.watch')
  t.deepEqual(env, {foo: 'bar'})
})

test('allows to specify parent script name', t => {
  const env = getScriptEnv({build: {foo: 'bar'}}, 'build.watch')
  t.deepEqual(env, {foo: 'bar'})
})

test('can accept snake-case representation of a camelCase name', t => {
  const env = getScriptEnv({checkCoverage: {foo: 'bar'}}, 'check-coverage')
  t.deepEqual(env, {foo: 'bar'})
})
