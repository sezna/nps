# nps roadmap

## Want to do

- Check [the issues](https://github.com/kentcdodds/nps/issues)

## Might do

- lifecycle hooks. Unfortunately by doing things this way one of the major things we lose is the ability to utilize
npm script lifecycle hooks. This makes me sad. So we might add this...
- Integrate with `npm-run-all` somehow? I love that package and think it makes composing scripts together really well.

## Wont do

- Recreate gulp
- Allow you to specify an individual script as a function to call rather than spawn a process. Instead you should create
a file and use the script to call into that script file. We want to keep this as simple and straightforward as possible.
Making it so you can call arbitrary functions is kind of getting into gulp land which is not something that we want to
get into.
