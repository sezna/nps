const console = require.requireActual('console')

module.exports = Object.assign({}, console, {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
})
