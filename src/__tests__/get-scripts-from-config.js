import {spy} from 'sinon'
import getScriptsFromConfig from '../get-scripts-from-config'

test('returns empty object by default', () => {
  expect(getScriptsFromConfig()).toEqual({})
})

test('passes input to the scripts if it is a function', () => {
  const input = 'hello'
  const scripts = spy()
  getScriptsFromConfig(scripts, input)
  expect(scripts.calledOnce).toBe(true)
  const [firstArg] = scripts.firstCall.args
  expect(firstArg).toBe(input)
})

test('just uses the scripts object if it is an object', () => {
  const scripts = {boo: 'bar'}
  expect(getScriptsFromConfig(scripts)).toBe(scripts)
})
