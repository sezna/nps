import {isPlainObject} from 'lodash'
import getScriptByPrefix, {scriptToObject} from './get-script-by-prefix'

test('scriptToObject returns null when script is not object or string ', () => {
  const actual = scriptToObject('foo', 42)
  expect(actual).toBeNull()
})

test('scriptToObject returns non-null object when script is string ', () => {
  const actual = scriptToObject('foo', 'hello')
  expect(isPlainObject(actual)).toBeTruthy()
  expect(actual).not.toBeNull()
})

test('scriptToObject returns non-null object when script is string ', () => {
  const scriptArg = {
    script: 'hello',
  }
  const actual = scriptToObject('foo', scriptArg)
  expect(isPlainObject(actual)).toBeTruthy()
  expect(actual).not.toBeNull()
})

test('getScriptByPrefix returns null when no matching script', () => {
  const config = {scripts: {}}
  const message = getScriptByPrefix(config, 'w')
  expect(message).toBeNull()
})

test('getScriptByPrefix returns null when no matching script', () => {
  const config = {scripts: {}}
  const message = getScriptByPrefix(config, 'w.a.b')
  expect(message).toBeNull()
})

test('getScriptByPrefix resolves single prefixes with string values', () => {
  const config = {
    scripts: {
      watch: 'echo watch',
    },
  }
  const actual = getScriptByPrefix(config, 'w')
  const expected = {
    script: 'echo watch',
    name: 'watch',
    description: '',
  }
  expect(actual).toEqual(expected)
})

test('getScriptByPrefix resolves nested prefixes with string values', () => {
  const config = {
    scripts: {
      watch: {
        js: {
          foo: 'echo foo',
        },
      },
    },
  }
  const actual = getScriptByPrefix(config, 'w.j.f')
  const expected = {
    script: 'echo foo',
    name: 'watch.js.foo',
    description: '',
  }
  expect(actual).toEqual(expected)
})

test(
  'getScriptByPrefix resolves single prefixes with object values && script key',
  () => {
    const config = {
      scripts: {
        foo: {
          description: 'Foo script',
          script: 'echo foo',
        },
      },
    }
    const actual = getScriptByPrefix(config, 'f')
    const expected = {
      script: 'echo foo',
      name: 'foo',
      description: 'Foo script',
    }
    expect(actual).toEqual(expected)
  },
)

test(
  'getScriptByPrefix resolves nested prefixes with object values && script key',
  () => {
    const config = {
      scripts: {
        watch: {
          foo: {
            description: 'Foo script',
            script: 'echo foo',
          },
        },
      },
    }
    const actual = getScriptByPrefix(config, 'w.f')
    const expected = {
      script: 'echo foo',
      name: 'watch.foo',
      description: 'Foo script',
    }
    expect(actual).toEqual(expected)
  },
)

test('getScriptByPrefix resolves ambiguities with single prefix', () => {
  const config = {
    scripts: {
      foo: {
        js: {
          default: 'foo.js script',
          script: 'echo foo.js',
        },
      },
      foobar: {
        description: 'Foobar script',
        script: 'echo foobar',
      },
    },
  }
  const actual = getScriptByPrefix(config, 'f')
  const expected = {
    script: 'echo foobar',
    name: 'foobar',
    description: 'Foobar script',
  }
  expect(actual).toEqual(expected)
})

describe('getScriptByPrefix resolves ambiguities with nested prefix', () => {
  let config
  beforeEach(() => {
    config = {
      scripts: {
        foo: {
          bar: {
            default: 'echo foo.bar',
            baz: {
              default: 'echo foo.bar.baz',
              joe: {
                default: {
                  script: 'echo foo.bar.baz.joe',
                },
              },
              invalid: 42,
              s: {
                t: 'echo t',
              },
            },
          },
        },
        foobar: {
          description: 'Foobar script',
          script: 'echo foobar',
        },
      },
    }
  })
  test('Foobar works correctly', () => {
    const actual = getScriptByPrefix(config, 'f')
    const expected = {
      script: 'echo foobar',
      name: 'foobar',
      description: 'Foobar script',
    }
    expect(actual).toEqual(expected)
  })
  test('foo.bar works correctly', () => {
    const actual = getScriptByPrefix(config, 'f.b')
    const expected = {
      script: 'echo foo.bar',
      name: 'foo.bar.default',
      description: '',
    }
    expect(actual).toEqual(expected)
  })
  test('foo.bar.baz works correctly', () => {
    const actual = getScriptByPrefix(config, 'f.b.b')
    const expected = {
      script: 'echo foo.bar.baz',
      name: 'foo.bar.baz.default',
      description: '',
    }
    expect(actual).toEqual(expected)
  })
  test('foo.bar.baz.joe works correctly', () => {
    const actual = getScriptByPrefix(config, 'f.b.b.j')
    const expected = {
      script: 'echo foo.bar.baz.joe',
      name: 'foo.bar.baz.joe.default',
      description: '',
    }
    expect(actual).toEqual(expected)
  })
  test('foo.bar.baz.x returns null', () => {
    const actual = getScriptByPrefix(config, 'f.b.b.x')
    expect(actual).toBeNull()
  })
  test('f.x returns null', () => {
    const actual = getScriptByPrefix(config, 'f.x')
    expect(actual).toBeNull()
  })
  test('d as prefix matches default', () => {
    const actual = getScriptByPrefix(config, 'f.b.b.d')
    const expected = {
      name: 'foo.bar.baz.default',
      description: '',
      script: 'echo foo.bar.baz',
    }
    expect(actual).toEqual(expected)
  })
  test('returns null when script is a number', () => {
    const actual = getScriptByPrefix(config, 'f.b.b.i')
    expect(actual).toBeNull()
  })
})

describe(
  'getScriptByPrefix resolves ambiguities with defaults correctly',
  () => {
    let config
    beforeEach(() => {
      config = {
        scripts: {
          foo: {
            bar: {
              default: 'echo foo.bar',
              define: 'echo define',
            },
            john: {
              default: 'echo foo.john',
            },
          },
        },
      }
    })
    test('Resolves default when a prefix is not deep enough', () => {
      const actual = getScriptByPrefix(config, 'f.b')
      const expected = {
        script: 'echo foo.bar',
        name: 'foo.bar.default',
        description: '',
      }
      expect(actual).toEqual(expected)
    })

    test(
      'Resolves a script when prefix can match default script as well',
      () => {
        const actual = getScriptByPrefix(config, 'f.b.d')
        const expected = {
          script: 'echo define',
          name: 'foo.bar.define',
          description: '',
        }
        expect(actual).toEqual(expected)
      },
    )

    test(
      'Resolves a script when prefix can match default script as well',
      () => {
        const actual = getScriptByPrefix(config, 'f.b.d')
        const expected = {
          script: 'echo define',
          name: 'foo.bar.define',
          description: '',
        }
        expect(actual).toEqual(expected)
      },
    )

    test('Resolves default script when prefix def has no other match', () => {
      const actual = getScriptByPrefix(config, 'f.j.def')
      const expected = {
        script: 'echo foo.john',
        name: 'foo.john.default',
        description: '',
      }
      expect(actual).toEqual(expected)
    })
  },
)
