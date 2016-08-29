/* eslint func-style:0, max-len:[2, 130] */
import path from 'path'
import fs from 'fs'
import os from 'os'
import {createHash} from 'crypto'
import test from 'ava'
import tester from 'cli-tester/es5'

const babel = require.resolve('babel-cli/bin/babel-node')

const hash = string => createHash('md5').update(string).digest('hex')
const tmpConfig = string => path.join(os.tmpdir(), `tmp-config-${hash(string)}.js`)
const writeConfig = (file, string) => new Promise(resolve => fs.writeFile(file, string, resolve))
const rmConfig = file => new Promise(resolve => fs.unlink(file, resolve))


test('p-s: run without args', t =>
  tester(babel, require.resolve('./p-s'))
    .then(({code, stdout, stderr}) => {
      t.is(code, 0, 'should exit with code 0')
      t.regex(stdout, /Usage: p-s \[options]/, 'should show help by default')
      t.is(stderr, '', 'should not have any errors')
    }))


const writeFooBarConfig = ({title}) => writeConfig(tmpConfig(title), `
  module.exports = {
    scripts: {
      foo: {
        description: 'Foo',
        script: 'foo',
      },
      bar: {
        description: 'Bar',
        script: 'bar',
      },
    }
  };
`)
const removeFooBarConfig = ({title}) => rmConfig(tmpConfig(title))


test('p-s: run with config', t => Promise.resolve()
  .then(() => writeFooBarConfig(t))
  .then(() => tester(babel, require.resolve('./p-s'), '--config', tmpConfig(t.title))) // eslint-disable-line ava/use-t-well
  .then(({stdout}) => {
    t.regex(stdout, /foo - Foo - foo/, 'should show help for scripts from config')
  })
  .then(() => removeFooBarConfig(t))
)
