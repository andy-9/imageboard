#!/usr/bin/env bash
set -e
set -x

rsync --recursive --verbose --delete public/ andy@leo.uberspace.de:/home/andy/code/imageboard
