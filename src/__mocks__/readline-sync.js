const mock = {}

module.exports = {
  keyInYN: jest.fn(() => {
    return Boolean(mock.keyInYNReturn)
  }),
  mock,
}
