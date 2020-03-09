#!/bin/bash

clean_master()
{
  git checkout master
  git reset origin/master --hard
  git clean -fd
  git pull
}

bump_version()
{
  clean_master

  # Get versions
  STABLE_COCKPIT_VERSION=$(mvn -q -Dexec.executable="echo" -Dexec.args='${project.version}' --non-recursive exec:exec | sed 's/-SNAPSHOT//g')
  LAST_STABLE_COCKPIT_VERSION=$(sed -n 's:.*<a name="\(.*\)"><\/a>.*:\1:p' CHANGELOG.md | head -1)

  # Update files
  if git checkout -b product/release-$STABLE_COCKPIT_VERSION
  then
    mvn versions:set -DgenerateBackupPoms=false -DnewVersion=$STABLE_COCKPIT_VERSION
    sed -i "s/$LAST_STABLE_COCKPIT_VERSION/$STABLE_COCKPIT_VERSION/g" README.md
    yarn --cwd frontend version --no-git-tag-version --new-version $STABLE_COCKPIT_VERSION

    yarn global add conventional-changelog-cli
    $(yarn global bin)/conventional-changelog -p angular -k frontend/package.json -i CHANGELOG.md -s
    sed -i "1i<a name=\"$STABLE_COCKPIT_VERSION\"></a>" CHANGELOG.md

    echo
    echo "Petals Cockpit is now in release version ($STABLE_COCKPIT_VERSION)."
    echo "Check updated files before commiting (chore: bump version to $STABLE_COCKPIT_VERSION)"
  else
    exit 0
  fi
}

prepare_for_development()
{
  clean_master

  # Update files
  if git checkout -b product/development-$1
  then
    mvn versions:set -DgenerateBackupPoms=false -DnewVersion=$1-SNAPSHOT
    yarn --cwd frontend version --no-git-tag-version --new-version $1-alpha
    # Commit
    echo "Updated files are about to be sent to the repository."
    read -p $'Do you confirm? (Y/n)\n> ' confirmation
    if [[ $confirmation =~ ^[Yy]?$ ]]
    then
      git add frontend/package.json
      git add pom.xml
      git add backend/pom.xml
      git add cockpit/pom.xml
      git commit -m "chore: prepare for next development"
      git push --set-upstream origin product/release-$1
    fi
  else
    exit 0
  fi
}

if [[ -z $(git status --porcelain) ]]
then
  read -p $'1 - Bump version to release / 2 - Prepare for development\n> ' response
  case $response in
    1) bump_version
    ;;
    2) read -p $'What is the next version?\n> ' version; prepare_for_development $version
    ;;
    *) exit 0
  esac
else
  echo "Please stage your changes before bumping cockpit version!"
  exit 0
fi
