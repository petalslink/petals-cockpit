FROM node:9.2.1 as frontend-builder

COPY . /home/petals-cockpit

WORKDIR /home/petals-cockpit/frontend

RUN yarn && yarn run build:product

# ---------------------------------------------------------

FROM fabric8/maven-builder as backend-builder

COPY --from=frontend-builder /home/petals-cockpit /home/petals-cockpit

WORKDIR /home/petals-cockpit

RUN mvn -s ci/settings.xml clean verify antrun:run@build-product-dist -DskipTests

# ---------------------------------------------------------

FROM openjdk:8u151-jre

COPY --from=backend-builder /home/petals-cockpit/cockpit/target/dist /home/petals-cockpit/cockpit/target/dist

WORKDIR /home/petals-cockpit/cockpit/target/dist

EXPOSE 8080

CMD ./petals-cockpit.sh
