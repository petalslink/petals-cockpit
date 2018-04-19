#!/bin/bash
# This script should be run from {petals-cockpit-root-dir}/e2e/

# go to petals-cockpit root dir
cd ..

# clean previous DB and outputs
rm -rf e2e/cockpit.mv.db e2e/cockpit.trace.db
rm -rf e2e/logs/cockpit-e2e-run.*.log

# variables
config="e2e/e2e-backend-config.yml"
migration="e2e/migrations.xml"
jar="cockpit/target/dist/lib/petals-cockpit-*.jar"
cockpitJar="java -ea -jar $jar"

# run backend from petals-cockpit root dir
$cockpitJar db migrate $config --migrations $migration
$cockpitJar server $config > e2e/logs/cockpit-e2e-run.out.log 2> e2e/logs/cockpit-e2e-run.err.log &
PID=$!
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "!!!   Started backend with PID:  $PID     !!!"
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"

# run frontend e2e test
cd frontend
sleep 4
yarn run e2e:product

# kill backend
echo "killing backend: $PID"
kill $PID

# go back to original directory
echo "E2E tests over."
cd ../e2e
