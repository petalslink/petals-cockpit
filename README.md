# PetalsCockpit - Global

In order to create an executable product, simply build the frontend, the backend and then the product that will embed both of them:


- Build the frontend
```sh
$ cd frontend && ng build && cd ..
```
- Build Petals Cockpit (it will also build the backend):
```sh
$ mvn clean package
```
- Execute Petals Cockpit:
```sh
$ java -jar cockpit/target/petals-cockpit-0.0.1-SNAPSHOT-capsule.jar server cockpit/default.yml
```