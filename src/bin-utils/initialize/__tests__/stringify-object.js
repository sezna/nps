import stringifyObject from './../stringify-object'

const objectToStringify = {
  foo: 'a',
  bar: {
    baz: 'b',
  },
}

test('stringify object correctly', () => {
  const stringObject = stringifyObject(objectToStringify, '    ')
  expect(stringObject).toMatchSnapshot()
})
