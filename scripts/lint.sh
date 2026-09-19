#!/usr/bin/env bash

FINAL_STATUS=0

biome check || FINAL_STATUS=$?
#tsc --project packages/backend/tsconfig.json --noEmit || FINAL_STATUS=$?
tsc --project packages/common/tsconfig.json --noEmit || FINAL_STATUS=$?
tsc --project packages/post-components/tsconfig.json --noEmit || FINAL_STATUS=$?
tsc --project packages/frontend-v5/tsconfig.json --noEmit || FINAL_STATUS=$?
tsc --project tsconfig.json --noEmit || FINAL_STATUS=$?

exit $FINAL_STATUS
