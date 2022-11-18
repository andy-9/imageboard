#!/usr/bin/env bash
set -e
set -x

rsync --recursive --verbose --delete --exclude ".git" --exclude "node_modules" --exclude "uploads" --exclude "secrets.json" . andy@leo.uberspace.de:/home/andy/code/imageboard
ssh andy@leo.uberspace.de "supervisorctl stop imageboard && cd ~/code/imageboard && npm install && supervisorctl start imageboard"
