FROM node:6

MAINTAINER Petals / Linagora

RUN echo "deb http://httpredir.debian.org/debian jessie-backports main" > /etc/apt/sources.list.d/jessie-backports.list \
    && apt-get update && apt-get -y install \
      chromium \
      xvfb \
      openjdk-8-jre-headless \
      # needed by webdriver!!
      libgconf-2-4 \
    && apt-get -y clean && apt-get -y autoclean \
    && npm set -g progress=false
