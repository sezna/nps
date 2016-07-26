module.exports = {
  scripts: {
    start: 'echo start',
    test: 'echo test',
    foo: {
      default: 'echo foo',
      bar: {
        default: 'echo foo:bar',
        baz: 'echo foo:bar:baz'
      }
    },
    bar: 'echo bar',
    fooBar: 'echo foo-bar',
    foobar: 'echo "foo bar"',
    baz: 'echo \'baz buzz\''
  }
};
