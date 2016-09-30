import {resolve} from 'path'
import runNPS from './run-nps'

const fixturesPath = resolve(__dirname, './fixtures')

test(
  'without arguments',
  () => snapshot()
)

test(
  'with config with default script',
  () => snapshot('-c ./package-scripts-with-default.js')
)

test(
  'with a missing config',
  () => snapshot('-c ./something-that-does-not-exist.js')
)

test(
  'with --silent',
  () => snapshot('test --silent')
)

test(
  'with --require',
  () => snapshot('--config ./es6-package-scripts.js --require babel-register log')
)

function snapshot(args) {
  return runNPS(fixturesPath, args).then(results => {
    const snapshottableResults = relativizePaths(results)
    expect(snapshottableResults).toMatchSnapshot()
  })
}

/**
 * This takes the results object and removes environment-specific elements from the path.
 * @param {Object} results - This is the results object from runNPS
 * @return {Object} - The new results object with the clean paths
 */
function relativizePaths(results) {
  return Object.keys(results).reduce((obj, key) => {
    obj[key] = results[key].replace(resolve(__dirname, '../'), '<projectRootDir>')
    return obj
  }, {})
}
