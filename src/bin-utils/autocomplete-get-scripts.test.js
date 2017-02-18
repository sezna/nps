import getScripts from './autocomplete-get-scripts'

const stubConfig = {
  scripts: {
    build: {
      default: {script: 'build'},
      watch: 'build.watch',
      main: {umd: 'build.main.umd', default: 'build.main'},
    },
    lint: {
      default: {script: 'lint', description: 'lint things'},
      watch: 'lint.watch',
    },
    like: 'echo "I like you"',
    test: 'test',
    camelCase: 'camelCase',
    cover: {description: 'this is a description', script: 'this is the script'},
  },
}

const tests = [
  [[{like: '', lint: 'thing', build: 'nope'}, 'l'], ['like', 'lint']],
  [[{like: '', lint: 'thing', build: 'nope'}, 'b'], ['build']],
  [
    [{like: {default: 'everything'}, lint: 'thing', build: 'nope'}, 'li'],
    ['like', 'lint'],
  ],
  [
    [{like: {things: 'everything'}, lint: 'thing', build: 'nope'}, 'li'],
    ['like.things', 'lint'],
  ],
  [
    [
      {
        like: {
          things: 'everything',
          otherThings: {default: {script: 'echo hi'}},
        },
        lint: 'thing',
        build: 'nope',
      },
      'li',
    ],
    ['like.things', 'like.otherThings', 'lint'],
  ],
  [
    [stubConfig.scripts],
    [
      'build',
      'build.watch',
      'build.main',
      'build.main.umd',
      'lint',
      'lint.watch',
      'like',
      'test',
      'camelCase',
      'cover',
    ],
  ],
  [[stubConfig.scripts, 'l'], ['lint', 'lint.watch', 'like']],
  [[stubConfig.scripts, 'b.m'], ['build.main', 'build.main.umd']],
  [[stubConfig.scripts, 'b.m.u'], ['build.main.umd']],
  [[stubConfig.scripts, 'b.m.us'], []],
  [[stubConfig.scripts, 'build.main.umd'], ['build.main.umd']],
  [[stubConfig.scripts, 'camel-c'], ['camel-case']],
  [
    [{lint: {say: 'hi'}, linter: {say: {allo: 'hallo'}}}, 'lin.s.a'],
    ['linter.say.allo'],
  ],
]

tests.forEach(([input, output], index) => {
  test(String(index), () => {
    expect(getScripts(...input)).toEqual(output)
  })
})
