# Petals Cockpit
Running demo (mock) [https://victornoel.gitlab.io/petals-cockpit](https://victornoel.gitlab.io/petals-cockpit)
- Username: admin
- Password: admin

## Trying Petals Cockpit

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

### Running Petals Cockpit

Don't forget to first initialise the database (see below).

Execute Petals Cockpit:
```
$ java -jar cockpit/target/petals-cockpit-0.3.0-SNAPSHOT-capsule.jar server cockpit/default.yml
```

### Available Commands

A user can be added with:
```
$ java -jar cockpit/target/petals-cockpit-0.3.0-SNAPSHOT-capsule.jar add-user -u username -n Name -p password cockpit/default.yml
```

The database can be migrated to the latest version with:
```
$ java -jar cockpit/target/petals-cockpit-0.3.0-SNAPSHOT-capsule.jar db migrate cockpit/default.yml
```

### Working with the backend and the frontend

To execute backend commands, you can use:
```
$ cd backend/
$ mvn -s ../ci/settings.xml compile exec:java@cli -Dexec.args="db migrate default.yml"
```

The following command will simply execute the backend:
```
$ cd backend/
$ mvn -s ../ci/settings.xml compile dependency:properties exec:exec@server
```

To work on the frontend without mock (i.e., with the backend previously started):
```
$ cd frontend/
$ ng serve --proxy-config proxy.conf.json -e=dev-nomock
```

## Copyright and License

Petals Cockpit is made by Linagora under the AGPLv3 license, see LICENSE.md.
