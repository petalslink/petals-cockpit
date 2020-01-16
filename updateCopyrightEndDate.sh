#!/bin/sh
#
# Copyright (c) 2014-2020 Linagora
#
# This program/library is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 2.1 of the License, or (at your
# option) any later version.
#
# This program/library is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
# FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License
# for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program/library; If not, see http://www.gnu.org/licenses/
# for the GNU Lesser General Public License version 2.1.
#

ROOT_DIR=$1
NEW_YEAR=2020
PREVIOUS_YEAR=$(($NEW_YEAR - 1))
if [ -z "$ROOT_DIR" ]; then
	echo "The root directory of files to process is missing (first parameter)"
	exit 1
fi
FILES=`find $ROOT_DIR -type f -name "*" -print | grep -v "/.svn/" | grep -v "/.git/" | grep -v "/.project" | grep -v "/.classpath" | grep -v "/.settings/" | grep -v "/target/" | grep -v "/frontend/" | grep -Ev ".*\.(jar|csv|db|log|json|eea)$"`
for FILE in $FILES
do
	if [ -f $FILE ]; then
		echo "Processing: $FILE"
		perl -pi -e "s/(^\W*Copyright \([cC]\) ((\d\d\d\d-)?\d\d\d\d .* )?(\d\d\d\d-)+)$PREVIOUS_YEAR Linagora$/\${1}$NEW_YEAR Linagora/" $FILE
		perl -pi -e "s/(^\W*Copyright \([cC]\) ((\d\d\d\d-)?\d\d\d\d .* )?)$PREVIOUS_YEAR Linagora$/\${1}$PREVIOUS_YEAR-$NEW_YEAR Linagora/" $FILE
	fi
done

exit 0
