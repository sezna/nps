module.exports = {
  scripts: {
    default: {
      default: 'echo start',
      stuff: 'echo start:stuff'
    },
    test: 'echo test',
    prefoo: {
      default: 'echo prefoo',
      bar: 'echo prefoo:bar'
    },
    foo: {
      default: 'nps prefoo && echo foo',
      bar: {
        default: 'nps prefoo.bar && echo foo:bar && nps postfoo.bar',
        baz: 'echo foo:bar:baz'
      }
    },
    bar: 'echo bar && nps postbar',
    postbar: 'echo postbar',
    prefooBar: 'echo prefoo-bar',
    fooBar: 'nps prefooBar && echo foo-bar',
    foobar: 'echo "foo bar"',
    baz: 'echo \'baz buzz\'',
    postfoo: {
      bar: 'echo postfoo:bar'
    }
  }
};
