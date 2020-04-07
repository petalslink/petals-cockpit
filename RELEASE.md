# Release process

## GIT
**Bump version :**

- execute `Release.sh` (may need permissions) and choose `1 - Bump version to release`
- when the script is done, verify the content of CHANGELOG.md and adapt it!
- commit all of it with message: `chore: bump version to X.X.X`
- push with branch named product/release-X.X.X
- merge
- then tag the merge commit via tags page on GitLab (https://gitlab.com/linagora/petals-cockpit/-/tags)
```
Tag name: vX.X.X
Create from: master
Messages: Release version X.X.X
```
**Prepare for development :** 
- execute `Release.sh` (may need permissions) and choose `2 - Prepare for development`
- follow steps and confirm
- merge

## DOCKER
```
docker build -t petals-cockpit .

docker commit petals-cockpit petals/petals-cockpit

docker push petals/petals-cockpit
```
