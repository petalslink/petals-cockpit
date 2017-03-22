#!/bin/sh
set -e

fluxbox -no-slit -no-toolbar -log /dev/null &
WMPID=$!

sleep 3

set +e
"$@"
RETVAL=$?
set -e

kill $WMPID

exit $RETVAL
