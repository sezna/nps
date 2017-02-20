# package-scripts examples

## Links to projects

Examples of how people use `nps`:

- **[nps](https://github.com/kentcdodds/nps):** [scripts](https://github.com/kentcdodds/nps/blob/master/package.json), [`package-scripts.js`](https://github.com/kentcdodds/nps/blob/master/package-scripts.js)
- **[react-component-template](https://github.com/nkbt/react-component-template)** uses `nps` to implement shareable npm
scripts. See then how dependent [react-swap](https://github.com/nkbt/react-swap) can reuse them. (Gotcha: - use
`process.cwd()` as the base for all paths).
- **[Hypercubed/EventsSpeedTests](https://github.com/Hypercubed/EventsSpeedTests)** uses `nps` to automate benchmark
running and reporting in node and the browser. `package-scripts.js` enables us to keep our scripts DRY. Combined with
[grunion](https://github.com/Hypercubed/grunion) allows benchmarks to be run, serially or concurrently, on glob
patterns.
- **[SmithersAssistant/Smithers](https://github.com/SmithersAssistant/smithers)** is an
[electron](https://electron.atom.io) based personal assistant. Smithers works on multiple platforms. Smithers uses `nps`
to dynamically find the current platform and execute the dev environment. Now we don't have to manually update the
`package.json` scripts when you are on a different platform!
[scripts](https://github.com/SmithersAssistant/smithers/blob/0732fed616d64ff4696110574e51c300cd409d4c/package.json#L67-L70),
[`package-scripts.js`](https://github.com/SmithersAssistant/smithers/blob/0732fed616d64ff4696110574e51c300cd409d4c/package-scripts.js)

## Inline Examples

### cross platform scripts

One of the big challenges with open source projects is that users and contributors have varying platforms. Because you
can't determine the platform in the `package.json`, you have to either have to duplicate scripts (like having a
`build:windows` and `build:unix` script), find CLIs that are cross platform (like
[`cross-env`](http://npm.im/cross-env)), or write your logic in a separate file to handle the platform.

You can also use [`cross-var`](http://npm.im/cross-var) in basically the same way to do the same for using environment
variables in your scripts so it works on both windows and mac/linux

With `package-scripts`, you can really easily have a single script that uses the platform to determine what should be
run. For example:

```javascript
var isWindows = require('is-os').isWindows
var removeDist = isWindows ? 'rmdir ./dist' : 'rm ./dist'
module.exports = {
  scripts: {
    build: {
      description: 'Build the project (built based on the platform)',
      script: removeDist + ' && babel --copy-files --out-dir dist src'
    }
  }
}
```

Note, in this specific scenario, I'd recommend that you actually use [`rimraf`](http://npm.im/rimraf), but I think you
get the idea 😄. This is a pretty nice win over traditional npm scripts 👍

### parallel scripts

Often, scripts can run concurrently because they are not interdependent. We recommend
[`concurrently`](http://npm.im/concurrently) for this:

```javascript
module.exports = {
  scripts: {
    validate: concurrent([
      'build',
      'lint',
      'test',
      'order.sandwich',
    ]),
    // etc...
  }
}

function concurrent(scripts) {
  const names = scripts.join(',')
  const quotedScripts = `"nps ${scripts.join('" "nps ')}"`
  return `concurrently --prefix "[{name}]" --names "${names}" ${quotedScripts}`
}
```

## Instructions

Thanks for using `nps`! I'm glad/I hope it's been helpful to you. Please add a link to your example here. If you're
adding a GitHub link, please make sure you hard-link so future changes in your codebase don't break the link. The
keyboard shortcut for this is `y`.

Also, if you'd like to be included as a [contributor](https://github.com/kentcdodds/nps#contributors), please follow the
[Contribution Guidelines](https://github.com/kentcdodds/nps/blob/master/CONTRIBUTING.md) and add yourself as a
contributor to the `.all-contributorsrc`. The best way to do this is by running:

```console
npm start addContributor <YOUR_GITHUB_USERNAME> example
```
