#!/bin/sh
set -u

export M2_STAGING_REPOSITORY="staging::default::file:$M2_STAGING_DIRECTORY"

maven() {
  mvn -s ci/settings.xml --errors -B -U -Dmaven.repo.local=$M2_CACHED_REPOSITORY $@
}

maven_build() {
  maven -Pjacoco -DaltDeploymentRepository=$M2_STAGING_REPOSITORY $@
}
