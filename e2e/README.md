# PetalsCockpit - End to end tests

This test suite executes protractor tests against a running instance of cockpit backend.  
Gitlab CI will automatically execute these tests according to `gitlab-ci.yml`, but not on all branches (not on `front/*` for instance). In any case, any changes to `master` branch will trigger end to end tests.  
Still, if a feature or a refactor is not supposed to temporarily "break" cockpit, it is recommended to run the tests beforehand.  
Here we will cover the procedure to execute locally.  

## Operation details

* First a application is build (backend and frontend)
* Backend is launched using 
  * `e2e/migration` for the db, which extends stadard db tables creation by injecting some data (users and workspaces). Beware, db is erased and rebuild each run.
  * `e2e/defaukt.yml` as configuration, to serve the frontend for the tests
* Backend is launched in the background (its PID is printed in case something wrong happens and it needs to be killed)
* protractor e2e tests from `/frontend/e2e/actual-e2e/` are run using `e2e:product`, against the backend previously launched
* Once tests are over backend is killed

## Build application and run tests

From `./e2e/` directory run:
```shell
./buildAndRunLocalE2ETests.sh
```
This script builds the application, first the frontend is build, then the backend (which embeds the frontend). 
Then it calls the other script that will run the tests per se, see following section.

## Clean and re-run tests

If the tests needs to be re-run but the application does not need to be rebuild, useful while writing tests. It can be done fron `./e2e/` using :
```shell
./runLocalE2ETests.sh
```
> Use this if only `/frontend/e2e/actual-e2e/` test were changed.

## Outputs

Running test will dump cockpit backend output and logs in`e2e/logs`. They will be deleted each run.
* *cockpit-e2e-run.out.log* : cockpit server output log
* *cockpit-e2e-run.global.log* : output log with lower log level & more dependency logs
* *cockpit-e2e-run.requests.log* : REST requests logs
* *cockpit-e2e-run.err.log* : Errors log

> Note: these logs can also be dowloaded from gitlab as `e2e-product` artefact.

DB files are generated in `./e2e/`: `e2e/cockpit.mv.db` and `e2e/cockpit.trace.db`, they can be explored using [h2 console](http://www.h2database.com/html/quickstart.html)
