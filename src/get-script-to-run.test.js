import test from 'ava'
import getScriptToRun from './get-script-to-run'

test('allows a prefix to be provided', t => {
  const script = getScriptToRun({build: 'stuff'}, 'b')
  t.is(script, 'stuff')
})

test('allows a multi-level prefix to be provided', t => {
  const script = getScriptToRun({build: {watch: 'watch stuff'}}, 'b.w')
  t.is(script, 'watch stuff')
})

test('falls back to using `get` for the full name if no prefix is provided', t => {
  const script = getScriptToRun({build: {watch: 'watch stuff'}}, 'build.watch')
  t.is(script, 'watch stuff')
})

test('can accept snake-case representation of a camelCase name', t => {
  const script = getScriptToRun({checkCoverage: 'checking coverage'}, 'check-coverage')
  t.is(script, 'checking coverage')
})
