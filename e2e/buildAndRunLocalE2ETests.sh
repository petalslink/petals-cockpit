#!/bin/bash
# This script should be run from {petals-cockpit-root-dir}/e2e/

# build application
cd ../frontend
ng build --e=prod --no-aot -bh='{{baseUrl}}'

cd ..
mvn -s ci/settings.xml clean verify antrun:run@build-product-dist -DskipTests

# run clean & tests
cd e2e
source ./runLocalE2ETests.sh
