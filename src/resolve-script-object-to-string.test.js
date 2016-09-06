import test from 'ava'
import resolveScriptObjectToString from './resolve-script-object-to-string'

test('returns undefined if a script is marked as hiddenFromHelp', t => {
  const lintCommand = 'eslint .'
  const result = resolveScriptObjectToString({script: lintCommand, hiddenFromHelp: true})
  t.is(result, undefined)
})

test('returns the script if hiddenFromHelp is false', t => {
  const lintCommand = 'eslint .'
  const result = resolveScriptObjectToString({script: lintCommand, hiddenFromHelp: false})
  t.is(result, lintCommand)
})

test('returns undefined if a script cannot be resolved to a string', t => {
  const result = resolveScriptObjectToString(42)
  t.is(result, undefined)
})

test('returns the string if given a string', t => {
  t.is('hello', resolveScriptObjectToString('hello'))
})

test('script can be an object', t => {
  const lintCommand = 'eslint .'
  const command = resolveScriptObjectToString({script: lintCommand})
  t.is(command, lintCommand)
})

test('get the default from the script object', t => {
  const buildCommand = 'webpack'
  const command = resolveScriptObjectToString({default: {script: buildCommand}})
  t.is(command, buildCommand)
})

test('returns undefined if the object with default cannot be resolved to a string', t => {
  const result = resolveScriptObjectToString({default: {blah: 'stuff'}})
  t.is(result, undefined)
})

test('resolves default to the script if it is a string', t => {
  const result = resolveScriptObjectToString({default: 'string'})
  t.is(result, 'string')
})

test('does not resolve a script object without a script or default', t => {
  const result = resolveScriptObjectToString({foo: 'bar'})
  t.is(result, undefined)
})
