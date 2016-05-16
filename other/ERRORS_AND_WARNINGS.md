# Errors and Warnings

If you were directed here, you probably saw a warning or error in your console when using `p-s` for your npm scripts.

## Unable to find config

This happens when you either:

1. Don't have a `package-scripts.js` file in your project
2. Specified a config with the `-c` or `--config` flag and it doesn't exist

### To fix:

Make sure that you either have a `package-scripts.js` file in your project or that you use the `-c`/`--config` flag to
point to a file that actually exists.

## Missing script

This happens if you specify a script name that can't be resolved to a script. See the docs/examples for how you can
define scripts and how they can be referenced.
