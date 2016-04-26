# p-s roadmap

## Want to do

- Add something like `p-s help` that will log out how to use the cli and available scripts to run in the project
- Add improved prefixing. Right now you can prefix the entire name of a script, but you couldn't prefix something like
`test.watch` as `t.w` and I think that'd be sweet
- Add the ability to specify multiple scripts that run in series

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
