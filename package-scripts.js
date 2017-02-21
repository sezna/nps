const transpile = 'babel --copy-files --out-dir dist --ignore *.test.js,fixtures src'
const cleanDist = 'rimraf dist'

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
        script: [cleanDist, transpile].join('&&'),
      },
      watch: {
        script: [cleanDist, `${transpile} --watch`].join('&&'),
      },
      andValidate: {
        description: 'Runs the normal build first, then validates the CLI',
        script: 'nps build && nps test.cli',
      },
    },
    lint: {
      description: 'lint the code with eslint',
      script: 'eslint .',
    },
    reportCoverage: {
      description: 'Report coverage stats to codecov. This should be run after the `cover` script and only on travis',
      script: 'codecov',
    },
    release: {
      description: 'We automate releases with semantic-release. This should only be run on travis',
      script: 'semantic-release pre && npm publish && semantic-release post',
    },
    validate: {
      description: 'This runs several scripts to make sure things look good before committing or on clean install',
      script: concurrent({
        'build-and-validate': {
          script: 'nps build.andValidate',
          color: 'bgBlue.bold',
        },
        test: {
          script: 'nps test',
          color: 'bgMagenta.bold',
        },
        'lint-staged': {
          script: 'nps lintStaged',
          color: 'bgGreen.bold',
        },
      }),
    },
    lintStaged: 'lint-staged',
    format: {
      description: 'auto-formats the code',
      script: 'prettier-eslint --write "src/**/*.js"',
    },
    addContributor: {
      description: 'When new people contribute to the project, run this',
      script: 'all-contributors add',
    },
    generateContributors: {
      description: 'Update the badge and contributors table',
      script: 'all-contributors generate',
    },
  },
  options: {
    silent: false,
  },
}

function concurrent(scripts) {
  const {
    colors,
    scripts: quotedScripts,
    names,
  } = Object.keys(scripts).reduce(reduceScripts, {
    colors: [],
    scripts: [],
    names: [],
  })
  const flags = [
    //   https://github.com/kimmobrunfeldt/concurrently/issues/91
    //   '--kill-others',
    `--prefix-colors "${colors.join(',')}"`,
    '--prefix "[{name}]"',
    `--names "${names.join(',')}"`,
    quotedScripts.join(' '),
  ]
  return `concurrently ${flags.join(' ')}`

  function reduceScripts(accumulator, scriptName) {
    const {script, color} = scripts[scriptName]
    accumulator.names.push(scriptName)
    accumulator.colors.push(color)
    accumulator.scripts.push(`"${script}"`)
    return accumulator
  }
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
