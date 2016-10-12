#!/bin/sh
set -u

export M2_STAGING_REPOSITORY="staging::default::file:$M2_STAGING_DIRECTORY"

maven() {
  mvn -s ci/settings.xml --errors -B -U -Dmaven.repo.local=$M2_CACHED_REPOSITORY $@
}

get_project_version() {
  maven -q -Dexec.executable='echo' -Dexec.args='${project.version}' --non-recursive exec:exec
}

maven_build() {
  maven -Pjacoco -DaltDeploymentRepository=$M2_STAGING_REPOSITORY $@
}

import_staging() {
  local version=$(get_project_version)
  maven dependency:get -Dartifact=org.ow2.petals:petals-cockpit-server:$version -DremoteRepositories=$M2_STAGING_REPOSITORY
}
