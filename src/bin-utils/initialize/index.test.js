/* eslint global-require:0 */
import {resolve} from 'path'
import {readFileSync} from 'fs'
import {spy} from 'sinon'

test('initialize JS normally', () => {
  const packageScriptsDestination = resolve('./src/bin-utils/initialize/fixtures/package-scripts.js')
  const packageJsonDestination = resolve('./src/bin-utils/initialize/fixtures/_package.json')
  const expectedPackageScripts = readFileSync(resolve('./src/bin-utils/initialize/fixtures/_package-scripts.js'), 'utf-8')
  const mockWriteFileSync = spy()
  const mockFindUpSync = spy(file => {
    if (file === 'package.json') {
      return packageJsonDestination
    }
    throw new Error('Should not look for anything but package.json')
  })
  jest.resetModules()
  jest.mock('find-up', () => ({sync: mockFindUpSync}))
  jest.mock('fs', () => ({writeFileSync: mockWriteFileSync}))
  const initialize = require('./index').default

  initialize()

  const [packageScriptsDestinationResult, packageScriptsStringResult] = mockWriteFileSync.secondCall.args
  const [packageJsonDestinationResult, packageJsonStringResult] = mockWriteFileSync.firstCall.args
  const {scripts: packageJsonScripts} = JSON.parse(packageJsonStringResult)

  expect(mockWriteFileSync.calledTwice)
  expect(packageScriptsDestinationResult).toBe(packageScriptsDestination)
  expect(packageScriptsStringResult).toBe(expectedPackageScripts)
  expect(packageJsonDestinationResult).toBe(packageJsonDestination)
  expect(packageJsonScripts).toEqual({
    start: 'nps',
    test: 'nps test',
  })
})

test('initialize YML normally', () => {
  const packageScriptsDestination = resolve('./src/bin-utils/initialize/fixtures/package-scripts.yml')
  const packageJsonDestination = resolve('./src/bin-utils/initialize/fixtures/_package.json')
  const expectedPackageScripts = readFileSync(resolve('./src/bin-utils/initialize/fixtures/_package-scripts.yml'), 'utf-8')
  const mockWriteFileSync = spy()
  const mockFindUpSync = spy(file => {
    if (file === 'package.json') {
      return packageJsonDestination
    }
    throw new Error('Should not look for anything but package.json')
  })
  jest.resetModules()
  jest.mock('find-up', () => ({sync: mockFindUpSync}))
  jest.mock('fs', () => ({writeFileSync: mockWriteFileSync}))
  const initialize = require('./index').default

  initialize('yaml')

  const [packageScriptsDestinationResult, packageScriptsStringResult] = mockWriteFileSync.secondCall.args
  const [packageJsonDestinationResult, packageJsonStringResult] = mockWriteFileSync.firstCall.args
  const {scripts: packageJsonScripts} = JSON.parse(packageJsonStringResult)

  expect(mockWriteFileSync.calledTwice)
  expect(packageScriptsDestinationResult).toBe(packageScriptsDestination)
  expect(packageScriptsStringResult).toBe(expectedPackageScripts)
  expect(packageJsonDestinationResult).toBe(packageJsonDestination)
  expect(packageJsonScripts).toEqual({
    start: 'nps',
    test: 'nps test',
  })
})

test('initialize without a test script should not add a test to the package.json', () => {
  const packageJsonDestination = resolve('./src/bin-utils/initialize/fixtures/_package-no-test.json')
  const mockWriteFileSync = spy()
  const mockFindUpSync = spy(file => {
    if (file === 'package.json') {
      return packageJsonDestination
    }
    throw new Error('Should not look for anything but package.json')
  })
  jest.resetModules()
  jest.mock('find-up', () => ({sync: mockFindUpSync}))
  jest.mock('fs', () => ({writeFileSync: mockWriteFileSync}))
  const initialize = require('./index').default

  initialize()
  const [, packageJsonStringResult] = mockWriteFileSync.firstCall.args
  const {scripts: packageJsonScripts} = JSON.parse(packageJsonStringResult)

  expect(packageJsonScripts).toEqual({
    start: 'nps',
  })
})

test('initialize without any scripts should successfully create an empty package-scripts.js file', () => {
  const packageJsonDestination = resolve('./src/bin-utils/initialize/fixtures/_package-no-scripts.json')
  const mockWriteFileSync = spy()
  const mockFindUpSync = spy(file => {
    if (file === 'package.json') {
      return packageJsonDestination
    }
    throw new Error('Should not look for anything but package.json')
  })
  jest.resetModules()
  jest.mock('find-up', () => ({sync: mockFindUpSync}))
  jest.mock('fs', () => ({writeFileSync: mockWriteFileSync}))
  const initialize = require('./index').default

  initialize()
  const [, packageJsonStringResult] = mockWriteFileSync.firstCall.args
  const {scripts: packageJsonScripts} = JSON.parse(packageJsonStringResult)

  expect(packageJsonScripts).toEqual({
    start: 'nps',
  })
})
