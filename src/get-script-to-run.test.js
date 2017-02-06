import getScriptToRun from './get-script-to-run'

test('allows a prefix to be provided', () => {
  const {script} = getScriptToRun({build: 'stuff'}, 'b')
  expect(script).toBe('stuff')
})

test('allows a multi-level prefix to be provided', () => {
  const {script} = getScriptToRun({build: {watch: 'watch stuff'}}, 'b.w')
  expect(script).toBe('watch stuff')
})

test('falls back to using `get` for the full name if no prefix is provided', () => {
  const {script} = getScriptToRun({build: {watch: 'watch stuff'}}, 'build.watch')
  expect(script).toBe('watch stuff')
})

test('can accept snake-case representation of a camelCase name', () => {
  const {script} = getScriptToRun({checkCoverage: 'checking coverage'}, 'check-coverage')
  expect(script).toBe('checking coverage')
})

test('fallsback to `default` if no prefix is found', () => {
  const scripts = {foo: {default: 'echo "default"', dee: 'echo "dee"'}}
  const {script: usesDefault} = getScriptToRun(scripts, 'foo')
  const {script: defaultIsPrefixFallback} = getScriptToRun(scripts, 'foo.def')
  const {script} = getScriptToRun(scripts, 'foo.de')

  expect(usesDefault).toBe('echo "default"')
  expect(defaultIsPrefixFallback).toBe('echo "default"')
  expect(script).toBe('echo "dee"')
})
