import kebabAndCamelCasify from '../kebab-and-camel-casify'

testUnchanged({boo: 'baz'})
testUnchanged({boo: {bar: 'baz', foo: 'bar'}})

testScenario(
  {e2e: 'foo'},
  {e2E: 'foo', 'e-2-e': 'foo', e2e: 'foo'},
  'shallow objects',
)
testScenario(
  {fooBar: 'baz'},
  {fooBar: 'baz', 'foo-bar': 'baz'},
  'shallow objects',
)

testScenario(
  {
    fooBar: {
      spam: {
        fooBaz: 'blah',
      },
    },
  },
  {
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
  },
  'deep objects',
)

testScenario(
  {
    default: 'nps _default foo',
    _default: 'echo "default"',
    foo: 'echo "foo"',
    _a: 'echo "a"',
    _: 'echo "this script name will be an empty string after conversion"',
    '-': 'echo "this script name will be an empty string after conversion"',
  },
  {
    default: 'nps _default foo',
    _default: 'echo "default"',
    foo: 'echo "foo"',
    _a: 'echo "a"',
    a: 'echo "a"',
    _: 'echo "this script name will be an empty string after conversion"',
    '-': 'echo "this script name will be an empty string after conversion"',
  },
  "won't overwrite existing scripts",
)

function testUnchanged(input, message = 'no change needed') {
  testScenario(input, input, message)
}

function testScenario(input, output, title) {
  test(title, () => {
    expect(kebabAndCamelCasify(input)).toEqual(output)
  })
}
