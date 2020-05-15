#!/bin/sh
set -u

export M2_STAGING_REPOSITORY="staging::default::file:$M2_STAGING_DIRECTORY"

maven() {
  mvn --settings ci/settings.xml --errors --batch-mode --update-snapshots -Dmaven.repo.local=$M2_CACHED_REPOSITORY $@
}

maven_build() {
  maven -DaltDeploymentRepository=$M2_STAGING_REPOSITORY $@
}
