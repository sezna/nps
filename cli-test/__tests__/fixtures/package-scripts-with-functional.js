const last = require('lodash/last')

module.exports = {
    scripts: {
      default: () => 'echo "default script"',
      withArguments: ([message1, message2]) => `echo "${message1} ${message2}"`,
      anotherScript: () => 'echo "default anotherScript"'
    },
  }