#!/usr/bin/env bash

FINAL_STATUS=0

biome check || FINAL_STATUS=$?
#tsc --project packages/backend/tsconfig.json --noEmit || FINAL_STATUS=$?
tsc --project packages/frontend/tsconfig.json --noEmit || FINAL_STATUS=$?
(cd packages/frontend && yarn astro check) || FINAL_STATUS=$?

exit $FINAL_STATUS
