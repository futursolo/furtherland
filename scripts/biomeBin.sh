#!/usr/bin/env bash

SOURCE_PATH="${BASH_SOURCE[0]}"
cd $(dirname -- $SOURCE_PATH)

yarn biome "$@"
