Needs Java 8 (set via JAVA_HOME if needed).

To initialise the database:

$ ./petals-cockpit.sh --migrate-db

To add an user:

$ ./petals-cockpit.sh add-user -u username -p password -n Name

To run Petals Cockpit:

$ ./petals-cockpit.sh

Access it from http://your-ip:8080

Change configurations in conf/config.yml
