#!/bin/bash
set -u

export M2_STAGING_REPOSITORY="staging::default::file:$M2_STAGING_DIRECTORY"

function maven() {
  mvn -s ci/settings.xml --errors -B -U -Dmaven.repo.local=$M2_CACHED_REPOSITORY $@
}

function get-project-version() {
  maven -q -Dexec.executable='echo' -Dexec.args='${project.version}' --non-recursive exec:exec
}

function maven-build() {
  maven -Pjacoco -DaltDeploymentRepository=$M2_STAGING_REPOSITORY $@
}

function import-staging() {
  local version=$(get-project-version)
  maven dependency:get -Dartifact=org.ow2.petals:petals-cockpit-server:$version -DremoteRepositories=$M2_STAGING_REPOSITORY
}
