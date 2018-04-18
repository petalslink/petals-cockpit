#!/bin/bash
#This script should be run from {petals-cockpit-root}/e2e/

#go to {petals-cockpit-root}
cd ..

#clean previous DB
rm -rf e2e/cockpit.mv.db e2e/cockpit.trace.db

#variables
config="e2e/default.yml"
migration="e2e/migrations.xml"
jar="cockpit/target/dist/lib/petals-cockpit-*.jar"
cockpitJar="java -ea -jar $jar"

#run backend from {petals-cockpit-root}
$cockpitJar db migrate $config --migrations $migration
nohup $cockpitJar server $config > e2e/cockpit-e2e-run.out 2> e2e/cockpit-e2e-run.err &
PID=$!
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "!!!   Started backend with PID:  $PID     !!!"
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"

#run frontend e2e test
cd frontend
sleep 4
yarn run e2e:product

#kill backend
echo "killing backend: $PID"
kill $PID
echo "killed"

#go back to original directory
cd ../e2e
