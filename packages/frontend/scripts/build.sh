#!/usr/bin/env bash
set -e

export FL_BUILDING=true

vite build --config ./vite.node.config.ts --outDir build/scripts
node build/scripts/prepare-prerender.mjs
react-router build
