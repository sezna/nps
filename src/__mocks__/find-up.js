const defaultSyncReturn = 'path/to/package-scripts.js'

const mock = {}

module.exports = {
  sync: jest.fn(() => (mock.hasOwnProperty('syncReturn') ? mock.syncReturn : defaultSyncReturn)),
  mock,
}
