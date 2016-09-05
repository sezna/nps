import {resolve} from 'path'
import {readFileSync} from 'fs'
import test from 'ava'
import proxyquire from 'proxyquire'
import {spy} from 'sinon'

test('normal case initialize', t => {
  const packageScriptsDestination = resolve('./fixtures/npsfile.js')
  const packageJsonDestination = resolve('./fixtures/_package.json')
  const expectedPackageScripts = readFileSync(resolve('./fixtures/_npsfile.js'), 'utf-8')
  const writeFileSync = spy()
  const findUpSync = spy(file => {
    if (file === 'package.json') {
      return packageJsonDestination
    }
    throw new Error('Should not look for anything but package.json')
  })
  const initialize = proxyquire('./index', {
    'find-up': {sync: findUpSync},
    fs: {writeFileSync},
  }).default

  initialize()

  const [packageScriptsDestinationResult, packageScriptsStringResult] = writeFileSync.firstCall.args
  const [packageJsonDestinationReuslt, packageJsonStringResult] = writeFileSync.secondCall.args
  const {scripts: packageJsonScripts} = JSON.parse(packageJsonStringResult)

  t.true(writeFileSync.calledTwice)
  t.is(packageScriptsDestinationResult, packageScriptsDestination)
  t.is(packageScriptsStringResult, expectedPackageScripts)
  t.is(packageJsonDestinationReuslt, packageJsonDestination)
  t.deepEqual(packageJsonScripts, {
    start: 'npm-package-scripts',
    test: 'npm-package-scripts test',
  })
})

test('initialize without a test script should not add a test to the package.json', t => {
  const packageJsonDestination = resolve('./fixtures/_package-no-test.json')
  const writeFileSync = spy()
  const findUpSync = spy(file => {
    if (file === 'package.json') {
      return packageJsonDestination
    }
    throw new Error('Should not look for anything but package.json')
  })
  const initialize = proxyquire('./index', {
    'find-up': {sync: findUpSync},
    fs: {writeFileSync},
  }).default

  initialize()
  const [, packageJsonStringResult] = writeFileSync.secondCall.args
  const {scripts: packageJsonScripts} = JSON.parse(packageJsonStringResult)

  t.deepEqual(packageJsonScripts, {
    start: 'npm-package-scripts',
  })
})
