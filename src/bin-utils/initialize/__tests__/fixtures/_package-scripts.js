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
      default: 'nps prefoo && nps "foo --bar=1"',
      bar: {
        default: 'nps prefoo.bar && nps foo.bar && nps postfoo.bar',
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
