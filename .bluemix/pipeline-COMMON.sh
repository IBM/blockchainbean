#!/usr/bin/env bash

set -ex

function install_nodejs {
    npm config delete prefix
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 8
    nvm use 8
    node -v
    npm -v
}

function install_composer {
    npm install -g composer-cli @ampretia/composer-wallet-cloudant
}

function install_jq {
    curl -o jq -L https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64
    chmod +x jq
    export PATH=${PATH}:${PWD}
}

function do_curl {
    HTTP_RESPONSE=$(mktemp)
    HTTP_STATUS=$(curl -w '%{http_code}' -o ${HTTP_RESPONSE} "$@")
    cat ${HTTP_RESPONSE}
    rm -f ${HTTP_RESPONSE}
    if [[ ${HTTP_STATUS} -ge 200 && ${HTTP_STATUS} -lt 300 ]]
    then
        return 0
    else
        return ${HTTP_STATUS}
    fi
}
