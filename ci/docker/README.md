To build, use:
```
docker build -t registry.gitlab.com/victornoel/petals-cockpit:latest .
```

To upload, use:
```
docker push registry.gitlab.com/victornoel/petals-cockpit:latest
```

To automate build and update, create a new branch, replace the current `.gitlab-ci.yml` by the following and push it to gitlab:
```
build:
    image: docker:latest
    services:
    - docker:dind
    stage: build
    script:
      - docker login -u gitlab-ci-token -p $CI_BUILD_TOKEN registry.gitlab.com
      - cd ci/docker
      - docker build -t registry.gitlab.com/victornoel/petals-cockpit:latest .
      - docker push registry.gitlab.com/victornoel/petals-cockpit:latest
```

