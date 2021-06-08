#!/bin/bash -ex

echo -e '\e[1m\e[36m========== Installing gulp & dependencies ==========\e[0m'
yarn install
# Install dependencies one-by-one to avoid race-conditions
yarn --cwd ./scripts/shared-hugo-scripts/wiki/
yarn --cwd ./scripts/shared-hugo-scripts/compatdb/
yarn hugo version
echo -e '\e[1m\e[36m========== Starting gulp deploy task ===============\e[0m'
yarn run build

echo -e '\e[1m\e[32m Success! Site deployed to `build` folder.\e[0m'
