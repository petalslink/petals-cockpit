#!/bin/bash
#
# Copyright (c) 2017 Linagora
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.

# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

# Extra checks
set -eu

# Let's get the distribution folder
COCKPIT_DIR="$(readlink -f "$(dirname "$(readlink -f "$0")")")"

# and execute all of this from it
cd "$COCKPIT_DIR"

# Set the path to the java executable
JAVA="${JAVA_HOME:-}/bin/java"
[ -x "$JAVA" ] || JAVA="$(which java)" || {
  echo "ERROR: java executable not found. Note that you can set JAVA_HOME to specify its location." >&2
  exit 1
}

JAR="$(ls -1 ./lib/petals-cockpit-*.jar 2>/dev/null)"

# Adapt pathes if architecture is Cygwin (unix if read by the command line and dos if read by java)
case "`uname`" in
  CYGWIN*)
    JAVA="$(cygpath --unix "$JAVA")"
    JAR="$(cygpath --unix "$JAR")"
    ;;
esac

ARGS=()
DBMIGRATE=true
DBCHECK=true
for var in "$@"; do
  if [[ $var == "--no-db-migrate" ]]; then
    DBMIGRATE=false
  elif [[ $var == "--no-db-check" ]]; then
    DBCHECK=false
  else
    ARGS[${#ARGS[@]}]="$var"
  fi
done

NBARGS=${#ARGS[@]}
if [[ ${NBARGS} -eq 0 ]]; then
  FARGS="server"
else
  FARGS="${ARGS[@]}"
fi

if [[ $DBMIGRATE == true ]]; then
  echo "Migrating database schema to latest version (disable with --no-db-migrate)"
  if "$JAVA" -jar "$JAR" db migrate ./conf/config.yml ; then
    echo "Migration successful, see logs for details"
  else
    echo "Migration failed, see logs for details" >&2
    exit 1
  fi
fi

if [[ $DBMIGRATE == false && $DBCHECK == true ]]; then
  echo "Checking database schema (disable with --no-db-check)"
  DBSTATUS=$("$JAVA" -jar "$JAR" db status ./conf/config.yml)
  if [[ ! $DBSTATUS =~ "is up to date" ]]; then
    echo "ERROR: Database schema is not up to date" >&2
    echo "$DBSTATUS" >&2
    exit 1
  fi
  echo "Database schema is up to date"
fi

echo "Starting Petals Cockpit"
exec "$JAVA" -jar "$JAR" $FARGS ./conf/config.yml
