import ava from 'ava'
import kebabAndCamelCasify from './kebab-and-camel-casify'

testUnchanged({boo: 'baz'})
testUnchanged({boo: {bar: 'baz', foo: 'bar'}})

test({e2e: 'foo'}, {e2E: 'foo', 'e-2-e': 'foo', e2e: 'foo'}, 'shallow objects')
test({fooBar: 'baz'}, {fooBar: 'baz', 'foo-bar': 'baz'}, 'shallow objects')

test({
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
  test(input, input, message)
}

function test(input, output, message) {
  const fn = t => t.deepEqual(kebabAndCamelCasify(input), output) // eslint-disable-line func-style
  if (message) {
    ava(message, fn)
  } else {
    ava(fn)
  }
}
