module.exports = {
  rootDir: '../src',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.js'],
  testPathIgnorePatterns: ['/node_modules/', '/fixtures/', '/helpers/'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/fixtures/',
    '/helpers/',
    // this is tested by the cli tests
    '/src/bin/nps.js',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
}
