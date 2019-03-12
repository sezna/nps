import getScriptToRun from '../get-script-to-run'

test('allows a prefix to be provided', () => {
  const script = getScriptToRun({build: 'stuff'}, 'b')
  expect(script).toEqual({scriptName: 'build', script: 'stuff'})
})

test('allows a multi-level prefix to be provided', () => {
  const script = getScriptToRun({build: {watch: 'watch stuff'}}, 'b.w')
  expect(script).toEqual({
    scriptName: 'build.watch',
    script: 'watch stuff',
  })
})

test('falls back to using `get` for the full name if no prefix is provided', () => {
  const script = getScriptToRun(
    {build: {watch: 'watch stuff'}},
    'build.watch',
  )
  expect(script).toEqual({
    scriptName: 'build.watch',
    script: 'watch stuff',
  })
})

test('can accept snake-case representation of a camelCase name', () => {
  const script = getScriptToRun(
    {checkCoverage: 'checking coverage'},
    'check-coverage',
  )
  expect(script).toEqual({
    scriptName: 'check-coverage',
    script: 'checking coverage',
  })
})

test('fallsback to `default` if no prefix is found', () => {
  const scripts = {foo: {default: 'echo "default"', dee: 'echo "dee"'}}
  const usesDefault = getScriptToRun(scripts, 'foo')
  const defaultIsPrefixFallback = getScriptToRun(scripts, 'foo.def')
  const script = getScriptToRun(scripts, 'foo.de')

  expect(usesDefault).toEqual({
    scriptName: 'foo',
    script: 'echo "default"',
  })
  expect(defaultIsPrefixFallback).toEqual({
    scriptName: 'foo.default',
    script: 'echo "default"',
  })
  expect(script).toEqual({scriptName: 'foo.dee', script: 'echo "dee"'})
})

test('finds the right script if the names are similar', () => {
  const script = getScriptToRun(
    {testX: 'stuff', test: 'moreStuff', btest: 'buildStuff'},
    'test',
  )
  expect(script).toEqual({scriptName: 'test', script: 'moreStuff'})
})

test('can use a functional script', () => {
  const script = getScriptToRun(
    {testX: 'stuff', test: () => 'moreStuff', btest: 'buildStuff'},
    'test',
  )
  expect(script).toEqual({scriptName: 'test', script: 'moreStuff'})
})

test('fallsback to functional `default` if no prefix is found', () => {
  const scripts = {
    foo: {default: () => 'echo "default"', dee: 'echo "dee"'},
  }
  const usesDefault = getScriptToRun(scripts, 'foo')
  const defaultIsPrefixFallback = getScriptToRun(scripts, 'foo.def')
  const script = getScriptToRun(scripts, 'foo.de')

  expect(usesDefault).toEqual({
    scriptName: 'foo',
    script: 'echo "default"',
  })
  expect(defaultIsPrefixFallback).toEqual({
    scriptName: 'foo.default',
    script: 'echo "default"',
  })
  expect(script).toEqual({scriptName: 'foo.dee', script: 'echo "dee"'})
})

test('allows a multi-level prefix to be provided and resolved for functional script', () => {
  const script = getScriptToRun(
    {build: {watch: () => 'watch stuff'}},
    'b.w',
  )
  expect(script).toEqual({
    scriptName: 'build.watch',
    script: 'watch stuff',
  })
})
