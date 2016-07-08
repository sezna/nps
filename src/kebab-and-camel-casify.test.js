import test from 'ava'
import kebabAndCamelCasify from './kebab-and-camel-casify'

testUnchanged({boo: 'baz'})
testUnchanged({boo: {bar: 'baz', foo: 'bar'}})

testScenario({e2e: 'foo'}, {e2E: 'foo', 'e-2-e': 'foo', e2e: 'foo'}, 'shallow objects')
testScenario({fooBar: 'baz'}, {fooBar: 'baz', 'foo-bar': 'baz'}, 'shallow objects')

testScenario({
  fooBar: {
    spam: {
      fooBaz: 'blah',
    },
  },
}, {
  fooBar: {
    spam: {
      fooBaz: 'blah',
      'foo-baz': 'blah',
    },
  },
  'foo-bar': {
    spam: {
      fooBaz: 'blah',
      'foo-baz': 'blah',
    },
  },
}, 'deep objects')

function testUnchanged(input, message = 'no change needed') {
  testScenario(input, input, message)
}

function testScenario(input, output, message) {
  const fn = t => t.deepEqual(kebabAndCamelCasify(input), output) // eslint-disable-line func-style
  if (message) {
    test(message, fn)
  } else {
    test(fn) // eslint-disable-line ava/test-title, I am lazy
  }
}
