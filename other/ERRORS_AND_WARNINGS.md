# Errors and Warnings

If you were directed here, you probably saw a warning or error in your console when using `p-s` for your npm scripts.

## Unable to find config

This happens when you either:

1. Don't have a `package-scripts.yml` or `package-scripts.js` file in your project
2. Specified a config with the `-c` or `--config` flag and it doesn't exist

### To fix:

Make sure that you either have a `package-scripts.yml`, `package-scripts.js` file in your project or that you use the `-c`/`--config` flag to
point to a file that actually exists.

## Missing script

This happens if you specify a script name that can't be resolved to a script. See the docs/examples for how you can
define scripts and how they can be referenced.

## Unable to preload module

This happens when you use the `--require` flag and the module you specify cannot be resolved.

### To fix:

1. Check that you spelled the module correctly
2. Check that the module you wish to require is require-able

## Failed with exit code

This means that one of the scripts `p-s` tried to run resulted in a non-zero exit code (a failing exit code)

### To Fix:

Try to run the script without `p-s` and verify that the script is working. If not, fix that. If it's working without `p-s` it could be a problem with `p-s`. Please file an issue.

## Emitted an error

This means that the child process for the specified script emitted an error.

### To Fix:

Look at the error and try to figure out why the script would be failing.

Try to run the script without `p-s` and verify that the script is working. If not, fix that. If it's working without `p-s` it could be a problem with `p-s`. Please file an issue.

## Config Must be an Object

Your `package-scripts.js`, `package-scripts.yml`, or whatever you specified as the `--config` must be an object or a function that returns an object.

### To Fix:

Make sure that your config is an object or a function that returns an object.

## Invalid flags

This happens if you pass flags to `p-s` that are not valid (like `p-s --invalid-flag-name`). This most often happens when you're trying to forward arguments to a script like: `p-s build --fast`

### To Fix:

Make sure you put your scripts and the relevant arguments in quotes: `p-s "build --fast"`
