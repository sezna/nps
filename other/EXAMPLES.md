# npm-package-scripts examples

## Links to projects
Examples of how people us `nps`:

- **[nps](https://github.com/kentcdodds/nps):** [scripts](https://github.com/kentcdodds/nps/blob/master/package.json#L6-L10), [`npsfile.js`](https://github.com/kentcdodds/nps/blob/master/npsfile.js)
- **[Smithers](https://github.com/SmithersAssistant/smithers):**
  [scripts](https://github.com/SmithersAssistant/smithers/blob/master/package.json#L67-L70), [`npsfile.js`](https://github.com/SmithersAssistant/smithers/blob/master/npsfile.js)

## Inline Examples

### cross platform scripts

One of the big challenges with open source projects is that users and contributors have varying platforms. Because you
can't determine the platform in the `package.json`, you have to either have to duplicate scripts (like having a
`build:windows` and `build:unix` script), find CLIs that are cross platform (like
[`cross-env`](http://npm.im/cross-env)), or write your logic in a separate file to handle the platform.

With `npm-package-scripts`, you can really easily have a single script that uses the platform to determine what should be
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
