const transpile = 'babel --copy-files --out-dir dist --ignore *.test.js,fixtures src'
const cleanDist = 'rimraf dist'
// const npsBin = 'babel-node src/bin/nps.js'
const npsBin = 'nps'
const validate = [
  'build.andValidate',
  'test',
  'lint',
]

module.exports = {
  scripts: {
    commit: {
      description: 'This uses commitizen to help us generate beautifully formatted commit messages',
      script: 'git-cz',
    },
    temp: 'sleep 8; exit 0',
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
      script: concurrent(validate),
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
  const names = scripts.join(',')
  const quotedScripts = `"${npsBin} ${scripts.join(`" "${npsBin} `)}"`
  const colors = [
    ['bgBlue.bold'],
    ['bgMagenta.bold'],
    ['bgGreen.bold'],
  ]
  return `concurrently --prefix-colors "${colors.join(',')}" --prefix "[{name}]" --names "${names}" ${quotedScripts}`
}
