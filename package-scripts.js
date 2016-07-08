/* eslint prefer-template:"off" */ // this file runs in node 0.10.0
const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1])
const validate = ['lint', 'build', 'cover']
if (nodeVersion < 4) {
  validate.slice(1)
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
        script: 'ava',
      },
      watch: {
        description: 'pass the -w flag on to the npm t command so ava will watch stuff',
        script: 'p-s test -w',
      },
    },
    build: {
      description: 'deletes the `dist` directory and transpiles all relevant `src` to the `dist`',
      script: 'rimraf dist && babel --copy-files --out-dir dist --ignore *.test.js src',
    },
    lint: {
      description: 'lint the code with eslint',
      script: 'eslint .',
    },
    checkCoverage: {
      description: 'We want to keep 100% code coverage on this project because... reasons',
      script: 'nyc check-coverage --statements 100 --branches 100 --functions 100 --lines 100',
    },
    cover: {
      description: 'we use nyc to instrument our code for coverage. Some of the config happens in package.json',
      script: 'nyc npm t',
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
      script: 'dist/bin/p-s.js -p ' + validate.join(',') + ' && p-s check-coverage',
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
