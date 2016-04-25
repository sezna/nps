import {spy} from 'sinon'
import test from 'ava'
import getScriptsFromConfig from './get-scripts-from-config'

test('returns empty object by default', t => {
  t.deepEqual(getScriptsFromConfig(), {})
})

test('passes input to the scripts if it is a function', t => {
  const input = 'hello'
  const scripts = spy()
  getScriptsFromConfig({scripts}, input)
  t.true(scripts.calledOnce)
  const [firstArg] = scripts.firstCall.args
  t.is(firstArg, input)
})

test('just uses the scripts object if it is an object', t => {
  const scripts = {boo: 'bar'}
  t.is(getScriptsFromConfig({scripts}), scripts)
})
