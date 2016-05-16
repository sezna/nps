# Maintaining

I'll add more here later, but here are the basic things:

1. We build on [travis][travis]
2. We have code coverage with [codecov][codecov]
3. We auto-release with [semantic-release][semantic-release] (on travis)
4. See the `.travis.yml` to know what node versions we support (semantic-release is configured to release on version 4)
5. We follow the [all-contributors][all-contributors] spec (v1.0.0-beta.0)
6. To manually test the CLI locally, you can run `npm run localstart`
7. We use [ghooks][ghooks] to share git hooks configured in the `package.json`
8. We use [opt-cli][opt-cli] to enable the git hooks (so new contributors don't have an extra barrier to contributing)

[travis]: https://travis-ci.org/kentcdodds/p-s
[codecov]: https://codecov.io/github/kentcdodds/p-s
[semantic-release]: https://npmjs.com/package/semantic-release
[all-contributors]: https://github.com/kentcdodds/all-contributors
[ghooks]: https://www.npmjs.com/package/ghooks
[opt-cli]: https://www.npmjs.com/package/opt-cli
