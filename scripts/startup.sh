#!/bin/bash

export PATH="/usr/local/bin/:$PATH"

# Navigate out of .app directory
# TODO: find a way which allow the script to run as shell script and as .app
cd ../../../

APP="$PWD/wipmap"
LOGS="$PWD/wipmap-logs"
DATA="$PWD/wipmap-data"
CONFIG="$PWD/wipmap.config.json"

mkdir -p $LOGS
mkdir -p $DATA

node $APP/server --open --fullscreen --config=$CONFIG --data=$DATA --log=$LOGS/$(date +%Y-%m-%d_%H-%M).log
