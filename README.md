# Petals Cockpit
Running demo (mock) [https://linagora.gitlab.io/petals-cockpit](https://linagora.gitlab.io/petals-cockpit)
- Username: admin
- Password: admin

## Trying Petals Cockpit

### Running the pre-compiled JAR

1. Download the latest compiled petals-cockpit:
 - [Version 0.9.0](https://gitlab.com/linagora/petals-cockpit/builds/artifacts/v0.9.0/download?job=release-product)
 - [Version Latest](https://gitlab.com/linagora/petals-cockpit/builds/artifacts/master/download?job=package-product-master)
2. Unpack it and go into the directory
3. Initialize the database (or update it if you already had one from a previous version):
```
$ java -jar petals-cockpit.jar db migrate config.yml
```
4. Create a user if necessary:
```
$ java -jar petals-cockpit.jar add-user -u username -n Name -p password config.yml
```
5. Run Petals Cockpit:
```
$ java -jar petals-cockpit.jar server config.yml
```

### Build an Executable Petals Cockpit

In order to create an executable product, simply build the frontend, the backend and then the product that will embed both of them:

- Build the frontend
```
$ cd frontend && yarn run prod && cd ..
```
- Build Petals Cockpit (it will also build the backend)
```
$ mvn -s ci/settings.xml clean package
```

### Running

Don't forget to first initialise the database (see below).

Execute Petals Cockpit:
```
$ java -jar cockpit/target/petals-cockpit-*-capsule.jar server cockpit/default.yml
```

### Available Commands


The database can be initialised or migrated to the latest version with:
```
$ java -jar cockpit/target/petals-cockpit-*-capsule.jar db migrate cockpit/default.yml
```
A user can be added with:
```
$ java -jar cockpit/target/petals-cockpit-*-capsule.jar add-user -u username -n Name -p password cockpit/default.yml
```


### Working with the backend and the frontend separately

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
$ yarn run proxy
```

## Copyright and License

Petals Cockpit is made by Linagora under the AGPLv3 license, see LICENSE.md.
