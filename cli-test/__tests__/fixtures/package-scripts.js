module.exports = {
  scripts: {
    test: 'echo "test script"',
    like: 'echo "I like you"',
    let: 'things',
    lint: {
      default: 'echo "lint.default"',
      sub: {
        thing: {
          description: 'this is a description',
          script: 'echo "deeply nested thing"',
        },
        hiddenThing: {
          hiddenFromHelp: true,
          script: 'echo "hidden"'
        }
      },
    },
  },
}
