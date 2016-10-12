FROM node:6

MAINTAINER Petals / Linagora

RUN echo "deb http://httpredir.debian.org/debian jessie-backports main" > /etc/apt/sources.list.d/jessie-backports.list \
    && apt-get -q update && apt-get -y -q install \
      chromium \
      xvfb \
      openjdk-8-jre-headless \
      # needed by webdriver!!
      libgconf-2-4 \
    && apt-get -y -q clean && apt-get -y -q autoclean \
    && wget https://github.com/yarnpkg/yarn/releases/download/v0.17.3/yarn_0.17.3_all.deb \
    && dpkg -i yarn_0.17.3_all.deb \
    && rm yarn_0.17.3_all.deb \
    && npm set -g progress=false
