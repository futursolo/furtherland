#!/usr/bin/env bash

FINAL_STATUS=0

biome check || FINAL_STATUS=$?
#tsc --project packages/backend/tsconfig.json --noEmit || FINAL_STATUS=$?
tsc --project packages/common/tsconfig.json --noEmit || FINAL_STATUS=$?
tsc --project packages/content-components/tsconfig.json --noEmit || FINAL_STATUS=$?
# The frontend is a React Router app; generate its route types before typechecking.
yarn workspace @furtherland/frontend frontend:typegen || FINAL_STATUS=$?
tsc --project packages/frontend/tsconfig.json --noEmit || FINAL_STATUS=$?
tsc --project tsconfig.json --noEmit || FINAL_STATUS=$?

exit $FINAL_STATUS
