/* eslint prefer-template:"off", no-var:"off", max-len:[2, 200] */ // this file runs in node 0.10.0
var transpile = 'babel --copy-files --out-dir dist --ignore *.test.js,fixtures src'
var cleanDist = 'rimraf dist'

var nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1])
var validate = ['build', 'test']
if (nodeVersion >= 4) {
  validate.push('lint') // we can't run linting on node versions < 4
}

module.exports = {
  scripts: {
    commit: {
      description: 'This uses commitizen to help us generate beautifully formatted commit messages',
      script: 'git-cz',
    },
    test: {
      default: {
        description: 'Run all test files in the src directory',
        script: 'cross-env NODE_ENV=test nyc ava',
      },
      watch: {
        description: 'Use AVA\'s watch mode. Good for TDD (adds a require to babel-register because nyc does it for us normally)',
        script: 'ava -r babel-register -w',
      },
    },
    build: {
      default: {
        description: 'deletes the `dist` directory and transpiles all relevant `src` to the `dist`',
        script: [cleanDist, transpile].join('&&'),
      },
      watch: {
        script: [cleanDist, transpile + ' --watch'].join('&&'),
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
      script: 'nps -p ' + validate.join(','),
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
