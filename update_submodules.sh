#!/usr/bin/env bash

rm -rf ./site/themes/shared-bulma-theme/
git submodule update --remote --merge
git add ./site/themes/shared-bulma-theme/
git commit -m "Updated shared-bulma-theme."
git push

