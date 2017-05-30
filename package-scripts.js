const {series, concurrent, rimraf} = require('nps-utils')

const transpile = 'babel --copy-files --out-dir dist --ignore *.test.js,fixtures src'
const cleanDist = rimraf('dist')

module.exports = {
  scripts: {
    commit: {
      description: 'This uses commitizen to help us generate beautifully formatted commit messages',
      script: 'git-cz',
    },
    test: {
      default: 'jest --config=test/jest.src.config.json --coverage',
      watch: 'jest --config=test/jest.src.config.json --watch',
      cli: {
        default: 'jest --config=test/jest.cli.config.json',
        watch: 'jest --config=test/jest.cli.config.json --watch',
      },
    },
    build: {
      default: {
        description: 'deletes the `dist` directory and transpiles all relevant `src` to the `dist`',
        script: series(cleanDist, transpile),
      },
      watch: {
        script: series(cleanDist, `${transpile} --watch`),
      },
      andValidate: {
        description: 'Runs the normal build first, then validates the CLI',
        script: series.nps('build', 'test.cli'),
      },
    },
    lint: {
      description: 'lint the code with eslint',
      script: 'eslint .',
    },
    validate: {
      description: 'This runs several scripts to make sure things look good before committing or on clean install',
      script: concurrent.nps('test', 'build.andValidate'),
    },
    format: {
      description: 'auto-formats the code',
      script: 'prettier-eslint --write "src/**/*.js"',
    },
    contributors: {
      add: {
        description: 'When new people contribute to the project, run this',
        script: 'all-contributors add',
      },
      generate: {
        description: 'Update the badge and contributors table',
        script: 'all-contributors generate',
      },
    },
  },
  options: {
    silent: false,
  },
}

// this is not transpiled
/*
  eslint
  max-len: 0,
  comma-dangle: [
    2,
    {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      functions: 'never'
    }
  ]
 */
