#!/usr/bin/env bash

rm -rf ./site/themes/shared-bulma-theme/
rm -rf ./scripts/shared-hugo-scripts/
git submodule update --remote --merge
