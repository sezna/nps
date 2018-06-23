/* eslint global-require:0 */
import path from 'path'
import {readFileSync} from 'fs'

function mockFindUpSync(packageJsonDestination) {
  return file => {
    if (file === 'package.json') {
      return packageJsonDestination
    }
    throw new Error('Should not look for anything but package.json')
  }
}

test('initialize JS normally', () => {
  const packageScriptsDestination = fixture('package-scripts.js')
  const packageJsonDestination = fixture('_package.json')
  const expectedPackageScripts = readFileSync(
    fixture('_package-scripts.js'),
    'utf-8',
  ).replace(/\r?\n/g, '\n')
  const mockWriteFileSync = jest.fn()
  jest.resetModules()
  jest.doMock('find-up', () => ({
    sync: mockFindUpSync(packageJsonDestination),
  }))
  jest.mock('fs', () => ({writeFileSync: mockWriteFileSync}))
  const initialize = require('../').default

  initialize()

  const [
    [packageJsonDestinationResult, packageJsonStringResult],
    [packageScriptsDestinationResult, packageScriptsStringResult],
  ] = mockWriteFileSync.mock.calls

  const {scripts: packageJsonScripts} = JSON.parse(packageJsonStringResult)

  expect(mockWriteFileSync).toHaveBeenCalledTimes(2)
  expect(packageScriptsDestinationResult).toBe(packageScriptsDestination)
  expect(packageScriptsStringResult).toBe(expectedPackageScripts)
  expect(packageJsonDestinationResult).toBe(packageJsonDestination)
  expect(packageJsonScripts).toEqual({
    start: 'nps',
    test: 'nps test',
  })
})

test('initialize YML normally', () => {
  const packageScriptsDestination = fixture('package-scripts.yml')
  const packageJsonDestination = fixture('_package.json')
  const expectedPackageScripts = readFileSync(
    fixture('_package-scripts.yml'),
    'utf-8',
  ).replace(/\r?\n/g, '\n')
  const mockWriteFileSync = jest.fn()
  jest.resetModules()
  jest.doMock('find-up', () => ({
    sync: mockFindUpSync(packageJsonDestination),
  }))
  jest.mock('fs', () => ({writeFileSync: mockWriteFileSync}))
  const initialize = require('../').default

  initialize('yml')

  const [
    [packageJsonDestinationResult, packageJsonStringResult],
    [packageScriptsDestinationResult, packageScriptsStringResult],
  ] = mockWriteFileSync.mock.calls
  const {scripts: packageJsonScripts} = JSON.parse(packageJsonStringResult)

  expect(mockWriteFileSync).toHaveBeenCalledTimes(2)
  expect(packageScriptsDestinationResult).toBe(packageScriptsDestination)
  expect(packageScriptsStringResult).toBe(expectedPackageScripts)
  expect(packageJsonDestinationResult).toBe(packageJsonDestination)
  expect(packageJsonScripts).toEqual({
    start: 'nps',
    test: 'nps test',
  })
})

test('initialize without a test script should not add a test to the package.json', () => {
  const packageJsonDestination = fixture('_package-no-test.json')
  const mockWriteFileSync = jest.fn()
  jest.resetModules()
  jest.doMock('find-up', () => ({
    sync: mockFindUpSync(packageJsonDestination),
  }))
  jest.mock('fs', () => ({writeFileSync: mockWriteFileSync}))
  const initialize = require('../').default

  initialize()
  const [[, packageJsonStringResult]] = mockWriteFileSync.mock.calls
  const {scripts: packageJsonScripts} = JSON.parse(packageJsonStringResult)

  expect(packageJsonScripts).toEqual({
    start: 'nps',
  })
})

test(`initialize without any scripts should successfully create an empty package-scripts.js file`, () => {
  const packageJsonDestination = fixture('_package-no-scripts.json')
  const mockWriteFileSync = jest.fn()
  jest.resetModules()
  jest.doMock('find-up', () => ({
    sync: mockFindUpSync(packageJsonDestination),
  }))
  jest.mock('fs', () => ({writeFileSync: mockWriteFileSync}))
  const initialize = require('../').default

  initialize()
  const [[, packageJsonStringResult]] = mockWriteFileSync.mock.calls
  const {scripts: packageJsonScripts} = JSON.parse(packageJsonStringResult)

  expect(packageJsonScripts).toEqual({
    start: 'nps',
  })
})

test('initialize without any core scripts and should not remove any core scripts from package.json', () => {
  const packageJsonDestination = fixture('_package-core-scripts.json')
  const mockWriteFileSync = jest.fn()
  jest.resetModules()
  jest.doMock('find-up', () => ({
    sync: mockFindUpSync(packageJsonDestination),
  }))
  jest.mock('fs', () => ({writeFileSync: mockWriteFileSync}))
  const initialize = require('../').default

  initialize()
  const [[, packageJsonStringResult]] = mockWriteFileSync.mock.calls
  const {scripts: packageJsonScripts} = JSON.parse(packageJsonStringResult)

  expect(packageJsonScripts).toEqual({
    start: 'nps',
    precommit: 'precommit hook',
    postcommit: 'postcommit hook',
    prepublish: 'prepublish hook',
    preuninstall: 'preuninstall hook',
  })
})

function fixture(name) {
  return path.join(__dirname, 'fixtures', name)
}
