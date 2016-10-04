# Petals Cockpit

## Build an Executable Petals Cockpit

In order to create an executable product, simply build the frontend, the backend and then the product that will embed both of them:

- Build the frontend
```
$ cd frontend && ng build && cd ..
```
- Build Petals Cockpit (it will also build the backend)
```
$ mvn -s ci/settings.xml clean package
```
- Execute Petals Cockpit
```
$ java -jar cockpit/target/petals-cockpit-0.0.1-SNAPSHOT-capsule.jar server cockpit/default.yml
```

A user can be adde with the following command:
```
  java -jar cockpit/target/petals-cockpit-0.0.1-SNAPSHOT-capsule.jar add-user -u username -n Name -p password cockpit/default.yml
```

## Copyright and License

Petals Cockpit is made by Linagora under the AGPLv3 license, see LICENSE.md.
