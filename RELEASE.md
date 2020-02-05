# Release process

## GIT
- pull the master branch
- create a branch from master named product/release-X.X.X
- change the version to a stable number in the 3 pom.xml: `mvn versions:set -DnewVersion=X.X.X`
- change the version to the next number in the package.json
- change the version in the appropriate places in the README.md
- generate the changelog from within frontend directory:
```
conventional-changelog -p angular -i ../CHANGELOG.md -s
```
*(conventional-changelog can be installed like that `yarn global add conventional-changelog-cli`)*
- verify the content of CHANGELOG.md and adapt it!
- commit all of it with message: `chore: bump version to X.X.X`
- push with branch named product/release-X.X.X
- merge
- then tag the merge commit via tags page on GitLab (https://gitlab.com/linagora/petals-cockpit/-/tags)
```
Tag name: vX.X.X
Create from: master
Messages: Release version X.X.X
```
- pull the master branch
- create a branch from master named product/development-Y.Y.Y where Y.Y.Y is the next version, it should not have zeros before numbers to generate the changelog correctly (1.04.0 should be 1.4.0)
- prepare for next development version (bump to Y.Y.Y-SNAPSHOT in poms and to Y.Y.Y-alpha in package.json)
- commit with message: `chore: prepare for next development`
- push with branch named product/development-Y.Y.Y
- merge

## DOCKER
```
docker build -t petals-cockpit .

docker commit petals-cockpit petals/petals-cockpit

docker push petals/petals-cockpit
```
