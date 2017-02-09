const mock = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}

const getLogLevel = jest.fn(() => 'info')

module.exports = () => mock
Object.assign(module.exports, {mock, getLogLevel, clearAll})

function clearAll() {
  mock.error.mockClear()
  mock.warn.mockClear()
  mock.info.mockClear()
}
