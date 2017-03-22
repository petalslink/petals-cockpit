#!/bin/sh

set -e

xvfb-run -s "-screen 0 1920x1080x24" $@
