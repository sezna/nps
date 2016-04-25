# p-s

All the benefits of npm scripts without the cost of a bloated package.json and limits of json

[![Build Status](https://img.shields.io/travis/kentcdodds/p-s.svg?style=flat-square)](https://travis-ci.org/kentcdodds/p-s)
[![Code Coverage](https://img.shields.io/codecov/c/github/kentcdodds/p-s.svg?style=flat-square)](https://codecov.io/github/kentcdodds/p-s)
[![version](https://img.shields.io/npm/v/p-s.svg?style=flat-square)](http://npm.im/p-s)
[![downloads](https://img.shields.io/npm/dm/p-s.svg?style=flat-square)](http://npm-stat.com/charts.html?package=p-s&from=2016-04-01)
[![MIT License](https://img.shields.io/npm/l/p-s.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)

## The problem

Even though npm scripts have a ton of advantages ([learn more][scripts-advantages]), it can grow into an
[unmaintainable mess][mess] in your `package.json` file. Part of the problem is we're configuring scripts in `json`
which has fundamental issues (like no comments).

## This solution

Put all of your scripts in a file called `package-scripts.js` and use `p-s` in a single `package.json` script:

**package-scripts.js**

```javascript
module.exports = {
  scripts: {
    lint: 'eslint .',
    test: {
      default: 'ava',
      watch: {
        script: 'ava -w',
        description: 'run in the amazingly intelligent AVA watch mode'
      }
    },
    build: {
      default: 'webpack',
      prod: 'webpack -p',
    }
  }
}
```

**package.json**

```json
{
  "scripts": {
    "start": "p-s"
  }
}
```

Then you can run:

```console
npm start lint
npm start test.watch
```

But the fun doesn't end there! You can use a prefix:

```console
npm start b # will run the build script
```

And if you want to speed things up even more, you can install [`npm-quick-run`](http://npm.im/npm-quick-run) and then:

```console
nr s build.prod
```

Cool stuff right? And there's more on [the roadmap][roadmap].

**Note:** You don't have to use the `start` script of course. If you're writing a node application, you're likely using
this for starting your server. You could easily create a `p-s` script and do: `npm run p-s b`.

## Installation

This module is distributed via [npm](https://www.npmjs.com/) which is bundled with [node](https://nodejs.org) and should
be installed as one of your project's `devDependencies`:

```
npm install --save-dev p-s
```

## API

### CLI

The CLI is fairly simple:

```console
$ p-s --help

  Usage: p-s [options]

  Options:

    -h, --help                                  output usage information
    -V, --version                               output the version number
    -s, --silent                                Silent p-s output
    -p, --parallel <script-name1,script-name2>  Scripts to run in parallel (comma seprated)
    -c, --config <filepath>                     Config file to use (defaults to nearest package-scripts.js)
```

#### silent

By default, `p-s` will log out to the console before running the command. You can add `-s` to your command to silence
this.

#### parallel

Run the given scripts in parallel. This enables handy workflows like this:

```console
npm start -p lint,build,cover && npm start check-coverage && npm start report-coverage
```

#### config

Use a different config

```
npm start -c ./other/package-scripts.js lint
```

Normally, `p-s` will look for a `package-scripts.js` file and load that to get the scripts. Generally you'll want to
have this at the root of your project (next to the `package.json`). But by specifying `-c` or `--config`, `p-s` will
use that file instead.

#### args

You can pass additional arguments to the script(s) that are being spawned:

```console
npm start lint --fix # --fix will be passed on to the lint script
```

That's all for the CLI.

### package-scripts.js

`p-s` expects to your `package-scripts.js` file to `module.exports` an object with the following properties:

#### scripts

This can be an object or a function that returns an object. See the annotated example below for what this object can
look like (and different ways to run them):

```javascript
module.exports = {
  scripts: {
    // you can assign a script property to a string
    simple: 'echo "this is easy"', // npm start simple
    test: {
      default: {
        script: 'echo "test things!"', // npm start test
        description: 'just pass it on to npm... Do not take this config very seriously :-)',
      },
      otherStuff: {
        // this one can be executed two different ways:
        // 1. npm start test.otherStuff
        // 2. npm start test.other-stuff
        script: 'echo "testing other things"',
        description: 'this is a handy description',
      },
    },
    // this one can be executed a few different ways:
    // 1. npm start k
    // 2. npm start kebab-case
    // 3. npm start kebabCase
    'kebab-case': 'echo "kebab-case"'
  },
}
```

Remember, I find it considerably nicer to just use [`npm-quick-run`](http://npm.im/npm-quick-run) and then I can do:

```console
nr k # runs npm start kebab-case
```

#### options

This object is used to configure `p-s` with the following options:

##### silent

Setting this to `true` will prevent `p-s` from outputting anything for your script (normally you'll get simple output
indicating the command that's being executed).

## LICENSE

MIT

[scripts-advantages]: [https://medium.freecodecamp.com/why-i-left-gulp-and-grunt-for-npm-scripts-3d6853dd22b8#.9qghcfdr9]
[mess]: [https://github.com/ReactiveX/rxjs/blob/a3ec89605a24a6f54e577d21773dad11f22fdb14/package.json#L14-L96]
[roadmap]: [https://github.com/kentcdodds/p-s/blob/master/ROADMAP.md]
