import resolveScriptObjectToString from './resolve-script-object-to-string'

test('returns undefined if a script is marked as hiddenFromHelp', () => {
  const lintCommand = 'eslint .'
  const result = resolveScriptObjectToString({script: lintCommand, hiddenFromHelp: true})
  expect(result).toBeUndefined()
})

test('returns the script if hiddenFromHelp is false', () => {
  const lintCommand = 'eslint .'
  const result = resolveScriptObjectToString({script: lintCommand, hiddenFromHelp: false})
  expect(result).toBe(lintCommand)
})

test('returns undefined if a script cannot be resolved to a string', () => {
  const result = resolveScriptObjectToString(42)
  expect(result).toBeUndefined()
})

test('returns the string if given a string', () => {
  expect('hello').toBe(resolveScriptObjectToString('hello'))
})

test('script can be an object', () => {
  const lintCommand = 'eslint .'
  const command = resolveScriptObjectToString({script: lintCommand})
  expect(command).toBe(lintCommand)
})

test('get the default from the script object', () => {
  const buildCommand = 'webpack'
  const command = resolveScriptObjectToString({default: {script: buildCommand}})
  expect(command).toBe(buildCommand)
})

test('returns undefined if the object with default cannot be resolved to a string', () => {
  const result = resolveScriptObjectToString({default: {blah: 'stuff'}})
  expect(result).toBeUndefined()
})

test('resolves default to the script if it is a string', () => {
  const result = resolveScriptObjectToString({default: 'string'})
  expect(result).toBe('string')
})

test('does not resolve a script object without a script or default', () => {
  const result = resolveScriptObjectToString({foo: 'bar'})
  expect(result).toBeUndefined()
})
