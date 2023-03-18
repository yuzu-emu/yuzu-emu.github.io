#!/bin/bash -ex

echo -e '\e[1m\e[36m========== Installing gulp & dependencies ==========\e[0m'
yarn install
# Install dependencies one-by-one to avoid race-conditions
yarn --cwd ./scripts/shared-hugo-scripts/
yarn hugo version
echo -e '\e[1m\e[36m========== Starting gulp deploy task ===============\e[0m'
if [[ -n "${EPHEMERAL_BASE_URL}" ]]; then
    echo -e "\e[1m\e[36m========== Ephemeral Mode URL: ${EPHEMERAL_BASE_URL} ===============\e[0m"
    yarn run gulp all --ephemeral "${EPHEMERAL_BASE_URL}"
else
    yarn run build
fi

echo -e '\e[1m\e[32m Success! Site deployed to `build` folder.\e[0m'
