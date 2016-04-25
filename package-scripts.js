module.exports = {
  scripts: {
    test: {
      default: {
        script: 'npm t',
        description: 'just pass it on to npm... Do not take this config very seriously :-)',
      },
      watch: {
        script: 'npm t -- -w',
        description: 'pass the -w flag on to the npm t command so ava will watch stuff',
      },
    },
    build: 'rimraf dist && babel --copy-files --out-dir dist --ignore *.test.js src',
    lint: {
      description: 'this does stuff',
      script: 'eslint .',
    },
    checkCoverage: {
      description: 'We want to keep 100% code coverage on this project because, reasons',
      script: 'nyc check-coverage --statements 100 --branches 100 --functions 100 --lines 100',
    },
    cover: {
      description: 'we use nyc to instrument our code for coverage. Some of the config happens in package.json',
      script: 'nyc npm t',
    },
    reportCoverage: {
      description: 'Report coverage stats to codecov. This should be run after the `cover` script',
      script: 'cat ./coverage/lcov.info | node_modules/.bin/codecov',
    },
  },
  options: {
    silent: false,
  },
}
