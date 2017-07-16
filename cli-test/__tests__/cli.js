import {resolve} from 'path'
import runNPS from './helpers/run-nps'

const fixturesPath = resolve(__dirname, './fixtures')

test('with config with default script', () =>
  snapshot('-c ./package-scripts-with-default.js'))

test('with a missing config', () =>
  snapshot('-c ./something-that-does-not-exist.js'))

test('with --silent', () => snapshot('test --silent'))

test('with --require', () =>
  snapshot('--config ./es6-package-scripts.js --require babel-register log'))

test('with --get-yargs-completions', () =>
  snapshot('--config ./package-scripts.js --get-yargs-completions li'))

test('with prefix', () => snapshot('--config ./package-scripts.js lint.s.t.s'))

test('with --no-scripts', () => snapshot('test --no-scripts'))

function snapshot(args) {
  return runNPS(fixturesPath, args).then(results => {
    const snapshottableResults = convertResultToLinuxSpecific(results)
    expect(snapshottableResults).toMatchSnapshot()
  })
}

function convertResultToLinuxSpecific(results) {
  return removeUnwantedQuotes(relativizePaths(results))
}

/**
 * This takes the results object and removes environment-specific
 * elements from the path.
 * @param {Object} results - This is the results object from runNPS
 * @return {Object} - The new results object with the clean paths
 */
function relativizePaths(results) {
  return Object.keys(results).reduce((obj, key) => {
    obj[key] = results[key]
      .replace(':/', ':\\')
      .replace(resolve(__dirname, '../'), '<projectRootDir>')
      .replace(/\\/g, '/')
    return obj
  }, {})
}

/**
 * This takes the results object and removes unwanted quotes
 * @param {Object} results - This is the results object from runNPS
 * @return {Object} - The new results object without unwanted quotes
 */
function removeUnwantedQuotes(results) {
  const splittedStdout = results.stdout.split(/\r?\n/)
  const {length} = splittedStdout
  if (length > 1) {
    splittedStdout[length - 2] = splittedStdout[length - 2].replace(/"/g, '')
  }
  const joinedStdoutResult = splittedStdout.join('\n')
  return Object.assign(results, {
    stdout: joinedStdoutResult,
  })
}
