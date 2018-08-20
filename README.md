# nps

All the benefits of npm scripts without the cost of a bloated package.json and limits of json

> `nps` is short for `npm-package-scripts`

> [What happened to p-s?](#what-happened-to-p-s)

[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![Dependencies][dependencyci-badge]][dependencyci]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npm-stat]
[![MIT License][license-badge]][LICENSE]

[![All Contributors](https://img.shields.io/badge/all_contributors-39-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome][prs-badge]][prs]
[![Donate][donate-badge]][donate]
[![Code of Conduct][coc-badge]][coc]
[![Roadmap][roadmap-badge]][roadmap]
[![Examples][examples-badge]][examples]
[![nps friendly][nps-badge]](#badge)

## Quick Video Intro :tv:

<a href="http://kcd.im/nps-video" title="Pull out npm scripts into another file with nps">
  <img src="https://github.com/kentcdodds/nps/raw/master/other/video-screenshot.png" alt="Video Screenshot" title="Video Screenshot" width="700" />
</a>

[Pull out npm scripts into another file with nps][video] by [Elijah Manor](https://github.com/elijahmanor) (5:53)

## The problem

Even though npm scripts have a ton of advantages ([learn more][scripts-advantages]), it can grow into an
[unmaintainable mess][mess] in your `package.json` file. Part of the problem is we're configuring scripts in `json`
which has fundamental issues (like no comments).

## This solution

`nps` is a package that solves this problem by allowing you to move your scripts to a `package-scripts.js` file. Because
this file is a JavaScript file, you can do a lot more with your project scripts. Here's an example of a
`package-scripts.js` file:

```javascript
const npsUtils = require('nps-utils') // not required, but handy!

module.exports = {
  scripts: {
    default: 'node index.js',
    lint: 'eslint .',
    test: {
      // learn more about Jest here: https://facebook.github.io/jest
      default: 'jest',
      watch: {
        script: 'jest --watch',
        description: 'run in the amazingly intelligent Jest watch mode'
      }
    },
    build: {
      // learn more about Webpack here: https://webpack.js.org/
      default: 'webpack',
      prod: 'webpack -p',
    },
    // learn more about npsUtils here: https://npm.im/nps-utils
    validate: npsUtils.concurrent.nps('lint', 'test', 'build'),
  },
}
```

Or in case you prefer YAML, here's an example of how that would look in a `package-scripts.yml` file:

```yml
scripts:
    default: node index.js
    lint: eslint .
    test:
        # learn more about Jest here: https://kcd.im/egghead-jest
        default: jest
        watch:
            script: jest --watch
            description: run in the amazingly intelligent Jest watch mode
    build:
        default: webpack
        prod: webpack -p
    validate: concurrent "nps lint" "nps test" "nps build"
```

To use `nps`, it's recommended that you either install it globally (`npm i -g nps`) or add `./node_modules/bin` to your
`$PATH` (be careful that you know what you're doing when doing this, find out how [here](https://youtu.be/2WZ5iS_3Jgs)).

Then you can run:

```console
nps help
```

Which will output:

```console
Usage: nps [options] <script>...

Commands:
  init        automatically migrate from npm scripts to nps
  completion  generate bash completion script

Options:
  --config, -c      Config file to use (defaults to nearest package-scripts.yml
                    or package-scripts.js)
                      [default: "<path-to-your-project>/package-scripts.js"]
  --silent, -s      Silent nps output                  [boolean] [default: false]
  --log-level, -l   The log level to use
                    [choices: "error", "warn", "info", "debug"] [default: "info"]
  --require, -r     Module to preload
  -h, --help        Show help                                           [boolean]
  -v, --version     Show version number                                 [boolean]
  --help-style, -y  Style of help to use
                    [choices: "all", "scripts", "basic"] [default: "all"]

Examples:
  nps.js test build                         Runs the `test` script then the
                                            `build` script
  nps.js "test --cover" "build --prod"      Runs the `test` script and forwards
                                            the "--cover" flag then the `build`
                                            script and forwards the "--prod"
                                            flag

Available scripts (camel or kebab case accepted)

lint - eslint .
test - jest
test.watch - run in the amazingly intelligent Jest watch mode - jest --watch
build - webpack
build.prod - webpack -p
validate - concurrent "nps lint" "nps test" "nps build"
```
You can also use the help command with a script name
```console
nps help test.watch
```
Which will output the details of the script `test.watch`:

```console
test.watch - run in the amazingly intelligent Jest watch mode - jest --watch
```

Now, to run a script, you can run:

```console
nps lint
nps test.watch
# etc.
```

But the fun doesn't end there! You can use a prefix:

```console
nps b # will run the build script
nps help b # will display help for the build script
```

And these prefixes can go as deep as you like!

```console
nps b.p # will run the production build script
```

Cool stuff right? And there's more on [the roadmap][roadmap].

**Also** check out the [examples][examples]. You'll find some good stuff in there (including how to deal with windows
and other cross-platform issues).

**Note:** If you don't like installing things globally and don't want to muck with your `$PATH` (or don't want to
require that your co-workers or project contributors to do so), then you can add a single script to your `package.json`.
We recommend that you use the `start` script because it requires less typing:

**package.json**

```json
{
  "scripts": {
    "start": "nps"
  }
}
```

You don't have to use the `start` script if you don't want. Note that if you're writing a node application, you're
likely using `start` for starting your server. In that case, you can create a `default` script which will be run
when `nps` is run without arguments (so effectively it'll work just the same). But if you'd prefer, you can use whatever
you wish. For example you could easily create a `nps` script and do: `npm run nps b`.

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and should
be installed as one of your project's `devDependencies`:

```
npm install --save-dev nps
```

### global installation

You can install this module globally also (this is recommended):

```
npm install --global nps
```

From here you can use `nps` on the command line via one of the installed aliases: `nps` or `nps`.

If you do this, you may also be interested in installing the shell autocompletion script. See more about this below.

## Getting started

If you're already using npm scripts, you can get up and going really quickly with the `init` command:

```
./node_modules/.bin/nps init
```
or
```
./node_modules/.bin/nps init --type yml
```

This will use your `package.json` `scripts` to generate a `package-scripts.js` (respectively a `package-scripts.yml`)
file and update your `scripts` to utilize the `nps` binary.

## API

### CLI

#### Commands

##### help

If you have a `help` script, then your `help` script will be run. Otherwise, this will output the help.

> Note: you can do this with `nps --help`, but if you're using the `start` script in your `package.json` this allows you
> to run `npm start help` rather than `npm start -- --help`

##### init

As indicated above, this will migrate your npm scripts to package-scripts.

##### completion

```console
nps completion >> <your-bash-profile-file>
```

Normally `<your-bash-profile-file>` will be `~/.bash_profile`, `~/.bashrc`, or `~/.zshrc`.

Note: you should probably only do this if you have the package installed globally. In that case you should probably also
normally use the `nps` alias rather than `nps` because it's easier to type.

#### CLI options

##### -h, --help

Will print out the help you see above (the available scripts are colored 🌈 and come from the config specified/default
config).

##### -s, --silent

By default, `nps` will log out to the console before running the command. You can add `-s` to your command to silence
this.

##### --no-scripts

By default, the script's command text will log out to the console before running the command. You can add `--no-scripts` to prevent this.

##### -c, --config

Use a different config

```
nps -c ./other/package-scripts.js lint
```

Normally, `nps` will look for a `package-scripts.js` file and load that to get the scripts. Generally you'll want to
have this at the root of your project (next to the `package.json`). But by specifying `-c` or `--config`, `nps` will
use that file instead.


##### -l, --log-level

Specify the log level to use

##### -r, --require

You can specify a module which will be loaded before the config file is loaded. This allows you to preload for example
babel-register so you can use all babel presets you like.

##### scripts

To run a script, you simply provide the name of the script like so:

```console
nps cover
```

And you can run multiple scripts in series by simply adding more space-separated arguments.

```console
nps cover check-coverage
```

And you can pass arguments to scripts by putting the scripts in quotes:

```console
nps "test --cover" check-coverage
```

##### -y, --help-style

By default, `nps` will dump a very long help documentation to the screen based on your package-scripts.js file. You can modify this output with one of three help-style options:

`all` gives you the normal default output:
```console
nps help "--help-style all"
```

`scripts` will give you only the help information built from your package-scripts.js file
```console
nps help "--help-style scripts"
```

`basic` will give you only the name and description of the scripts from your package-scripts.js file
```console
nps help "--help-style basic"
```

That's all for the CLI.

### package-scripts.js

> Remember, this file is JavaScript, so you can write functions to make things more simple!
> See other/EXAMPLES.md for examples of cool things you can do with this.

`nps` expects to your `package-scripts.js` file to `module.exports` an object with the following properties:

#### scripts

This can be an object or a function that returns an object. See the annotated example below for what this object can
look like (and different ways to run them):

```javascript
module.exports = {
  scripts: {
    default: 'echo "This runs on `nps`"', // nps
    // you can assign a script property to a string
    simple: 'echo "this is easy"', // nps simple
    // you can specify whether some scripts should be excluded from the help list
    hidden: {
      script: 'debugging script',
      hiddenFromHelp: true,
    },
    test: {
      default: {
        script: 'jest', // nps test
        description: 'Run tests with jest',
        // your scripts will be run with node_modules/.bin in the PATH, so you can use locally installed packages.
        // this is done in a cross-platform way, so your scripts will work on Mac and Windows :)
        // NOTE: if you need to set environment variables, I recommend you check out the cross-env package, which works
        // great with nps
      },
      otherStuff: {
        // this one can be executed two different ways:
        // 1. nps test.otherStuff
        // 2. nps test.other-stuff
        script: 'echo "testing other things"',
        description: 'this is a handy description',
      },
    },
    // this one can be executed a few different ways:
    // 1. nps k
    // 2. nps kebab-case
    // 3. nps kebabCase
    'kebab-case': 'echo "kebab-case"',
    series: 'nps simple,test,kebabCase', // runs these other scripts in series
  },
}
```

```console
nps k # runs nps kebab-case
```

#### options

This object is used to configure `nps` with the following options:

##### silent

Setting this to `true` will prevent `nps` from outputting anything for your script (normally you'll get simple output
indicating the command that's being executed). This effectively sets the `logLevel` to `disable`.

##### logLevel

This sets the logLevel of `nps`.

## ENV variables

### LOG_LEVEL

By setting `LOG_LEVEL` environment variable you can control the log level for `nps`

## Log level

Log levels available:

- `error` - errors only
- `warn` - errors and warnings only
- `info` - info, errors, and warnings (default)

## Badge

Congratulations your repo is nps-friendly. Time to flaunt it! Add the nps-friendly badge to your README using the following markdown:

```markdown
[![nps friendly](https://img.shields.io/badge/nps-friendly-blue.svg?style=flat-square)](https://github.com/kentcdodds/nps)
```

Your badge will look like this:

[![nps friendly](https://img.shields.io/badge/nps-friendly-blue.svg?style=flat-square)](https://github.com/kentcdodds/nps)

It may also make sense to change your README.md or CONTRIBUTING.md to include or link to the nps project so that your new contributors may learn more about installing and using nps.

## FAQ

### How do I do ___ ?

Have you looked at the examples in [other/EXAMPLES.md][examples]?

### Why `npm start`?

_Just to be clear:_ You do **not** have to use the `start` script. You can use whatever you like. But I recommend using
the `start`. [npm scripts][npm scripts] are generally run with `npm run <script-name>`. There are some exceptions to
this. For example:

1. `npm run test` === `npm test` === `npm t`
2. `npm run start` === `npm start`

So, while you could use a script called `script` and run `npm run script build`, I just think it reads more clearly to
just use the `start` script and run `npm start build`. It's also nice that it's fewer things to type. You could also use
the `test` script and then type even less: `npm t build`, but thats just... odd.

Note, often servers are configured to run `npm start` by default to start the server. To allow for this case, you can
provide a `default` script at the root of your scripts which will be run when `npm start` is run without any arguments.
Effectively this will allow you to have a script run when `npm start` is executed.

## Inspiration

This was inspired by [a tweet][tweet] by [@sindresorhus][sindre].

## Thanks

Big thank you to [@tmpvar][tmpvar] for giving up the name `nps`! The original `nps` is now
called [`npmsearch-cli`](https://www.npmjs.com/package/npmsearch-cli).

## Related Packages

- [`nps-utils`][nps-utils] - a collection of utilities to make cross-platform scripts and many other patterns
(like running concurrent/parallel scripts)
- [`nps-i`](https://github.com/siddharthkp/nps-i) - interactive mode for nps

## Other Solutions

- [scripty][scripty] has a solution for this problem as well. The reason I didn't go with that though is you still need
a line for every script (one of the pains I'm trying to solve) and a each script requires its own file (one of the
benefits of npm scripts I wanted to keep).
- [nabs][nabs] is a compiler that turns a nicely structured YAML file into script entries in your package.json

### FAQ

#### What happened to p-s?

This project _is_ p-s! It was just renamed during a major version bump. There were a few
breaking changes for this to happen and those are documented on the [releases][releases]
page.

## Contributors

Thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars.githubusercontent.com/u/1500684?v=3" width="100px;"/><br /><sub><b>Kent C. Dodds</b></sub>](http://kent.doddsfamily.us)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=kentcdodds "Code") [📖](https://github.com/kentcdodds/p-s/commits?author=kentcdodds "Documentation") [🚇](#infra-kentcdodds "Infrastructure (Hosting, Build-Tools, etc)") [💡](#example-kentcdodds "Examples") [📹](#video-kentcdodds "Videos") [👀](#review-kentcdodds "Reviewed Pull Requests") | [<img src="https://avatars.githubusercontent.com/u/532272?v=3" width="100px;"/><br /><sub><b>David Wells</b></sub>](http://davidwells.io)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=DavidWells "Code") | [<img src="https://avatars.githubusercontent.com/u/802242?v=3" width="100px;"/><br /><sub><b>Abhishek Shende</b></sub>](https://twitter.com/abhishekisnot)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=abhishekisnot "Code") [⚠️](https://github.com/kentcdodds/p-s/commits?author=abhishekisnot "Tests") | [<img src="https://avatars.githubusercontent.com/u/185649?v=3" width="100px;"/><br /><sub><b>Rowan Oulton</b></sub>](http://travelog.io)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=rowanoulton "Code") [📖](https://github.com/kentcdodds/p-s/commits?author=rowanoulton "Documentation") [⚠️](https://github.com/kentcdodds/p-s/commits?author=rowanoulton "Tests") | [<img src="https://avatars.githubusercontent.com/u/1915716?v=3" width="100px;"/><br /><sub><b>Gilad Goldberg</b></sub>](https://github.com/giladgo)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=giladgo "Code") | [<img src="https://avatars.githubusercontent.com/u/14267457?v=3" width="100px;"/><br /><sub><b>Tim McGee</b></sub>](https://github.com/tim-mcgee)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=tim-mcgee "Code") [📖](https://github.com/kentcdodds/p-s/commits?author=tim-mcgee "Documentation") | [<img src="https://avatars.githubusercontent.com/u/175264?v=3" width="100px;"/><br /><sub><b>Nik Butenko</b></sub>](http://butenko.me)<br />[💡](#example-nkbt "Examples") [💻](https://github.com/kentcdodds/p-s/commits?author=nkbt "Code") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars.githubusercontent.com/u/1972567?v=3" width="100px;"/><br /><sub><b>Tommy</b></sub>](http://www.tommyleunen.com)<br />[🐛](https://github.com/kentcdodds/p-s/issues?q=author%3Atleunen "Bug reports") [💻](https://github.com/kentcdodds/p-s/commits?author=tleunen "Code") [⚠️](https://github.com/kentcdodds/p-s/commits?author=tleunen "Tests") [👀](#review-tleunen "Reviewed Pull Requests") | [<img src="https://avatars.githubusercontent.com/u/509946?v=3" width="100px;"/><br /><sub><b>Jayson Harshbarger</b></sub>](http://www.hypercubed.com)<br />[💡](#example-Hypercubed "Examples") [👀](#review-Hypercubed "Reviewed Pull Requests") | [<img src="https://avatars.githubusercontent.com/u/1355481?v=3" width="100px;"/><br /><sub><b>JD Isaacks</b></sub>](http://www.jisaacks.com)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=jisaacks "Code") [⚠️](https://github.com/kentcdodds/p-s/commits?author=jisaacks "Tests") | [<img src="https://avatars.githubusercontent.com/u/924465?v=3" width="100px;"/><br /><sub><b>Christopher Hiller</b></sub>](https://boneskull.com)<br />[👀](#review-boneskull "Reviewed Pull Requests") [🐛](https://github.com/kentcdodds/p-s/issues?q=author%3Aboneskull "Bug reports") [💻](https://github.com/kentcdodds/p-s/commits?author=boneskull "Code") [📖](https://github.com/kentcdodds/p-s/commits?author=boneskull "Documentation") [⚠️](https://github.com/kentcdodds/p-s/commits?author=boneskull "Tests") | [<img src="https://avatars.githubusercontent.com/u/1834413?v=3" width="100px;"/><br /><sub><b>Robin Malfait</b></sub>](https://robinmalfait.com)<br />[💡](#example-RobinMalfait "Examples") | [<img src="https://avatars.githubusercontent.com/u/622118?v=3" width="100px;"/><br /><sub><b>Eric McCormick</b></sub>](https://ericmccormick.io)<br />[👀](#review-edm00se "Reviewed Pull Requests") [📖](https://github.com/kentcdodds/p-s/commits?author=edm00se "Documentation") | [<img src="https://avatars.githubusercontent.com/u/1913805?v=3" width="100px;"/><br /><sub><b>Sam Verschueren</b></sub>](https://twitter.com/SamVerschueren)<br />[👀](#review-SamVerschueren "Reviewed Pull Requests") |
| [<img src="https://avatars.githubusercontent.com/u/1155589?v=3" width="100px;"/><br /><sub><b>Sorin Muntean</b></sub>](https://github.com/sxn)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=sxn "Code") [⚠️](https://github.com/kentcdodds/p-s/commits?author=sxn "Tests") [📖](https://github.com/kentcdodds/p-s/commits?author=sxn "Documentation") | [<img src="https://avatars.githubusercontent.com/u/1970063?v=3" width="100px;"/><br /><sub><b>Keith Gunn</b></sub>](https://github.com/gunnx)<br />[🐛](https://github.com/kentcdodds/p-s/issues?q=author%3Agunnx "Bug reports") [💻](https://github.com/kentcdodds/p-s/commits?author=gunnx "Code") [⚠️](https://github.com/kentcdodds/p-s/commits?author=gunnx "Tests") | [<img src="https://avatars.githubusercontent.com/u/1019478?v=3" width="100px;"/><br /><sub><b>Joe Martella</b></sub>](http://martellaj.github.io)<br />[🐛](https://github.com/kentcdodds/p-s/issues?q=author%3Amartellaj "Bug reports") [💻](https://github.com/kentcdodds/p-s/commits?author=martellaj "Code") [⚠️](https://github.com/kentcdodds/p-s/commits?author=martellaj "Tests") | [<img src="https://avatars.githubusercontent.com/u/1887854?v=3" width="100px;"/><br /><sub><b>Martin Segado</b></sub>](https://github.com/msegado)<br />[📖](https://github.com/kentcdodds/p-s/commits?author=msegado "Documentation") | [<img src="https://avatars.githubusercontent.com/u/36491?v=3" width="100px;"/><br /><sub><b>Bram Borggreve</b></sub>](http://colmena.io/)<br />[🐛](https://github.com/kentcdodds/p-s/issues?q=author%3Abeeman "Bug reports") [💻](https://github.com/kentcdodds/p-s/commits?author=beeman "Code") | [<img src="https://avatars.githubusercontent.com/u/86454?v=3" width="100px;"/><br /><sub><b>Elijah Manor</b></sub>](http://elijahmanor.com)<br />[📹](#video-elijahmanor "Videos") | [<img src="https://avatars.githubusercontent.com/u/10691183?v=3" width="100px;"/><br /><sub><b>Ragu Ramaswamy</b></sub>](https://github.com/rrag)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=rrag "Code") [⚠️](https://github.com/kentcdodds/p-s/commits?author=rrag "Tests") [🐛](https://github.com/kentcdodds/p-s/issues?q=author%3Arrag "Bug reports") |
| [<img src="https://avatars.githubusercontent.com/u/2915616?v=3" width="100px;"/><br /><sub><b>Erik Fox</b></sub>](http://www.erikfox.co/)<br />[🐛](https://github.com/kentcdodds/p-s/issues?q=author%3Aerikfox "Bug reports") [💻](https://github.com/kentcdodds/p-s/commits?author=erikfox "Code") [📖](https://github.com/kentcdodds/p-s/commits?author=erikfox "Documentation") [⚠️](https://github.com/kentcdodds/p-s/commits?author=erikfox "Tests") | [<img src="https://avatars.githubusercontent.com/u/5351262?v=3" width="100px;"/><br /><sub><b>Aditya Pratap Singh</b></sub>](http://blog.adityapsingh.com)<br />[👀](#review-addityasingh "Reviewed Pull Requests") | [<img src="https://avatars.githubusercontent.com/u/7687132?v=3" width="100px;"/><br /><sub><b>bumbleblym</b></sub>](https://github.com/bumbleblym)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=bumbleblym "Code") [📖](https://github.com/kentcdodds/p-s/commits?author=bumbleblym "Documentation") | [<img src="https://avatars.githubusercontent.com/u/7091543?v=3" width="100px;"/><br /><sub><b>Islam Attrash</b></sub>](https://twitter.com/IslamAttrash)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=Attrash-Islam "Code") | [<img src="https://avatars.githubusercontent.com/u/7215306?v=3" width="100px;"/><br /><sub><b>JasonSooter</b></sub>](https://github.com/JasonSooter)<br />[📖](https://github.com/kentcdodds/p-s/commits?author=JasonSooter "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/116871?v=3" width="100px;"/><br /><sub><b>Nate Cavanaugh</b></sub>](http://alterform.com)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=natecavanaugh "Code") | [<img src="https://avatars2.githubusercontent.com/u/3534924?v=3" width="100px;"/><br /><sub><b>Wissam Abirached</b></sub>](https://designingforscale.com)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=wabirached "Code") [⚠️](https://github.com/kentcdodds/p-s/commits?author=wabirached "Tests") |
| [<img src="https://avatars1.githubusercontent.com/u/12592677?v=3" width="100px;"/><br /><sub><b>Paweł Mikołajczyk</b></sub>](https://github.com/Miklet)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=Miklet "Code") [⚠️](https://github.com/kentcdodds/p-s/commits?author=Miklet "Tests") | [<img src="https://avatars0.githubusercontent.com/u/1295580?v=3" width="100px;"/><br /><sub><b>Kyle Welch</b></sub>](http://www.krwelch.com)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=kwelch "Code") [⚠️](https://github.com/kentcdodds/p-s/commits?author=kwelch "Tests") | [<img src="https://avatars3.githubusercontent.com/u/22868432?v=3" width="100px;"/><br /><sub><b>Lufty Wiranda</b></sub>](http://instagram.com/luftywiranda13)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=luftywiranda13 "Code") | [<img src="https://avatars6.githubusercontent.com/u/2936644?v=4" width="100px;"/><br /><sub><b>Bhargav Ponnapalli</b></sub>](http://imbhargav5.com)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=imbhargav5 "Code") | [<img src="https://avatars0.githubusercontent.com/u/1538572?v=4" width="100px;"/><br /><sub><b>falieson</b></sub>](https://github.com/Falieson)<br />[📖](https://github.com/kentcdodds/p-s/commits?author=Falieson "Documentation") [🔧](#tool-Falieson "Tools") | [<img src="https://avatars2.githubusercontent.com/u/22251956?v=4" width="100px;"/><br /><sub><b>Suhas Karanth</b></sub>](https://github.com/sudo-suhas)<br />[🐛](https://github.com/kentcdodds/p-s/issues?q=author%3Asudo-suhas "Bug reports") [💻](https://github.com/kentcdodds/p-s/commits?author=sudo-suhas "Code") | [<img src="https://avatars3.githubusercontent.com/u/1228867?v=4" width="100px;"/><br /><sub><b>Eric Skram</b></sub>](http://www.ericskram.com)<br />[📖](https://github.com/kentcdodds/p-s/commits?author=Vpr99 "Documentation") |
| [<img src="https://avatars2.githubusercontent.com/u/11901111?v=4" width="100px;"/><br /><sub><b>Kether Saturnius</b></sub>](http://www.k3th3r.com)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=iamkether "Code") [📖](https://github.com/kentcdodds/p-s/commits?author=iamkether "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/2536916?v=4" width="100px;"/><br /><sub><b>Sviatoslav</b></sub>](https://github.com/SleepWalker)<br />[🐛](https://github.com/kentcdodds/p-s/issues?q=author%3ASleepWalker "Bug reports") [💻](https://github.com/kentcdodds/p-s/commits?author=SleepWalker "Code") | [<img src="https://avatars2.githubusercontent.com/u/1470998?v=4" width="100px;"/><br /><sub><b>Wei Wang</b></sub>](https://github.com/onlywei)<br />[💻](https://github.com/kentcdodds/p-s/commits?author=onlywei "Code") | [<img src="https://avatars2.githubusercontent.com/u/1393142?v=4" width="100px;"/><br /><sub><b>Sami Jaber</b></sub>](http://twitter.com/samjabz)<br />[🐛](https://github.com/kentcdodds/p-s/issues?q=author%3Asamijaber "Bug reports") [💻](https://github.com/kentcdodds/p-s/commits?author=samijaber "Code") |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind welcome!

## LICENSE

MIT

[nps-badge]: https://img.shields.io/badge/nps-friendly-blue.svg?style=flat-square
[nps-github]: https://github.com/kentcdodds/nps
[scripts-advantages]: https://medium.freecodecamp.com/why-i-left-gulp-and-grunt-for-npm-scripts-3d6853dd22b8#.9qghcfdr9
[mess]: https://github.com/ReactiveX/rxjs/blob/a3ec89605a24a6f54e577d21773dad11f22fdb14/package.json#L14-L96
[roadmap]: https://github.com/kentcdodds/nps/blob/master/other/ROADMAP.md
[examples]: https://github.com/kentcdodds/nps/blob/master/other/EXAMPLES.md
[quick-run]: https://npmjs.com/package/npm-quick-run
[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/travis/kentcdodds/nps/master.svg?style=flat-square
[build]: https://travis-ci.org/kentcdodds/nps
[coverage-badge]: https://img.shields.io/codecov/c/github/kentcdodds/nps.svg?style=flat-square
[coverage]: https://codecov.io/github/kentcdodds/nps
[dependencyci-badge]: https://dependencyci.com/github/kentcdodds/nps/badge?style=flat-square
[dependencyci]: https://dependencyci.com/github/kentcdodds/nps
[version-badge]: https://img.shields.io/npm/v/nps.svg?style=flat-square
[package]: https://www.npmjs.com/package/nps
[downloads-badge]: https://img.shields.io/npm/dm/nps.svg?style=flat-square
[npm-stat]: http://npm-stat.com/charts.html?package=nps&from=2016-04-01
[license-badge]: https://img.shields.io/npm/l/nps.svg?style=flat-square
[license]: https://github.com/kentcdodds/nps/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[donate-badge]: https://img.shields.io/badge/%EF%BC%84-support-green.svg?style=flat-square
[donate]: http://kcd.im/donate
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/kentcdodds/nps/blob/master/other/CODE_OF_CONDUCT.md
[roadmap-badge]: https://img.shields.io/badge/%F0%9F%93%94-roadmap-CD9523.svg?style=flat-square
[examples-badge]: https://img.shields.io/badge/%F0%9F%92%A1-examples-8C8E93.svg?style=flat-square
[tweet]: https://twitter.com/sindresorhus/status/724259780676575232
[sindre]: https://github.com/sindresorhus
[tmpvar]: https://github.com/tmpvar
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors
[clarity]: https://github.com/kentcdodds/nps/issues/1
[scripty]: https://npmjs.com/package/scripty
[nabs]: https://npmjs.com/package/nabs
[npm scripts]: https://docs.npmjs.com/misc/scripts
[video]: http://kcd.im/nps-video
[releases]: https://github.com/kentcdodds/nps/releases/tag/v5.0.0
[nps-utils]: https://github.com/kentcdodds/nps-utils
