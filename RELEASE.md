# Release process

* create a branch named product/release-X.X.X
* change the version to a stable number in the 3 pom.xml: `mvn versions:set
  -DnewVersion=X.X.X`
* change the version to the next number in the package.json
* change the version in the appropriate places in the README.md
* generate the changelog from within frontend directory:

```
conventional-changelog -p angular -i ../CHANGELOG.md -s
```

_(conventional-changelog can be installed like that `yarn global add
conventional-changelog-cli`)_

* verify the content of CHANGELOG.md and adapt it!
* commit all of it with message: `chore: bump version to X.X.X`
* push with branch named product/release-X.X.X
* verify CI is ok
* merge
* tag the merge commit (with an annotated tag!) vX.X.X and message: Release
  version X.X.X

```
git tag -a vX.X.X -m "Release version X.X.X"
```

* prepare for next development version (bump to -SNAPSHOT in poms and to -alpha
  in package.json)
* commit with message: `chore: prepare for next development`
* push that on master with `--follow-tags` option
