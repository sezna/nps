const defaultSyncReturn = 'path/to/package-scripts.js'

const mock = {}

module.exports = {
  sync: jest.fn(() => {
    return mock.hasOwnProperty('syncReturn') ?
      mock.syncReturn :
      defaultSyncReturn
  }),
  mock,
}
