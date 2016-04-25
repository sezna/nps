// This was taken from json-package by the brilliant @bahmutov
// https://github.com/bahmutov/json-package/blob/10aa0eccff7a8c81fd21ad3322cf83b205f4f46a/src/find-scripts.js

export default findScripts

function findScripts(prefix, scripts) {
  const labels = Object.keys(scripts)
  const matchesExactlyPrefix = matchesExactly.bind(null, prefix)
  const exactMatches = labels.filter(matchesExactlyPrefix)
  if (exactMatches.length === 1) {
    return exactMatches
  }

  const startsWithPrefix = startsWith.bind(null, prefix)
  const matchingScripts = labels.filter(startsWithPrefix)
  return matchingScripts
}

function startsWith(prefix, str) {
  console.assert(typeof str === 'string', 'expected string', str) // eslint-disable-line no-console
  return str.indexOf(prefix) === 0
}

function sameLength(a, b) {
  return a.length === b.length
}

function matchesExactly(prefix, str) {
  return startsWith(prefix, str) &&
    sameLength(prefix, str)
}
