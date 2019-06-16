const defaultSyncReturn = 'path/to/package-scripts.js'

const mock = {}

module.exports = {
  sync: jest.fn(path => {
    if (/^\.npsrc(\.json)?$/.test(path)) {
      return mock.hasOwnProperty('cliReturn') ? mock.cliReturn : undefined
    }

    return mock.hasOwnProperty('syncReturn') ?
      mock.syncReturn :
      defaultSyncReturn
  }),
  mock,
}
