#!/usr/bin/env bash
set -e

export FL_BUILDING=true

rsbuild build --config ./rsbuild.node.config.ts
node build/scripts/prepare-prerender.mjs
rsbuild build
