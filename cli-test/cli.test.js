import {resolve} from 'path'
import runPS from './run-p-s'

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
  return runPS(fixturesPath, args).then(results => {
    expect(results).toMatchSnapshot()
  })
}
