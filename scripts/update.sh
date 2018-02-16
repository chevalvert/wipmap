#!/bin/bash

export PATH="/usr/local/bin/:$PATH"

# Navigate out of .app directory
# TODO: find a way which allow the script to run as shell script and as .app
cd ../../../

APP="$PWD/wipmap"

echo 'DETAILS:SHOW'

cd $APP
git fetch --tags

echo 'PROGRESS:25'

LATEST_TAG=$(git describe --tags `git rev-list --tags --max-count=1`)
git checkout $LATEST_TAG

echo 'PROGRESS:50'

if hash yarn 2>/dev/null; then
  yarn install
else
  npm install
fi

echo 'QUITAPP'
