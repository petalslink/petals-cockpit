# Petals Cockpit

## Trying Petals Cockpit

To use Petals Cockpit, in any case, you will need an instance of MongoDB running.

### Build an Executable Petals Cockpit

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
$ java -jar cockpit/target/petals-cockpit-0.1.0-capsule.jar server cockpit/default.yml
```

### Executing only the Backend

The following command will simply execute the backend (for testing for example):
```
$ mvn -s ci/settings.xml compile exec:exec -pl backend
```

### Available Commands

A user can be added with the following command:
```
$ java -jar cockpit/target/petals-cockpit-0.1.0-capsule.jar add-user -u username -n Name -p password cockpit/default.yml
```

## Copyright and License

Petals Cockpit is made by Linagora under the AGPLv3 license, see LICENSE.md.
