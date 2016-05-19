# Contributing

Thanks for being willing to contribute!

**Working on your first Pull Request?** You can learn how from this *free* series
[How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

## Project setup

1. Fork and clone the repo
2. `$ npm install` to install dependencies
3. `$ npm start validate` to validate you've got it working
4. Create a branch for your PR

## Add yourself as a contributor

This project follows the [all contributors][all-contributors] specification. To add yourself to the table of
contributors on the README.md, please use the automated script as part of your PR:

```console
npm start addContributor <YOUR_GITHUB_USERNAME>
```

Follow the prompt. If you've already added yourself to the list and are making a new type of contribution, you can run
it again and select the added contribution type.

## Committing and Pushing changes

This project uses [`semantic-release`][semantic-release] to do automatic releases and generate a changelog based on the
commit history. So we follow [a convention][convention] for commit messages. Please follow this convention for your
commit messages.

You can use `commitizen` to help you to follow [the convention](https://github.com/stevemao/conventional-changelog-angular/blob/master/convention.md)

Once you are ready to commit the changes, please use the below commands

1. `git add <files to be comitted>`
2. `$ npm start commit`

... and follow the instruction of the interactive prompt.

## Help needed

Please checkout the [other/ROADMAP.md](https://github.com/kentcdodds/p-s/blob/master/ROADMAP.md) and raise an issue to discuss
any of the items in the want to do or might do list.

Also, please watch the repo and respond to questions/bug reports/feature requests! Thanks!

[semantic-release]: https://npmjs.com/package/semantic-release
[convention]: https://github.com/stevemao/conventional-changelog-angular/blob/master/convention.md
[all-contributors]: https://github.com/kentcdodds/all-contributors
