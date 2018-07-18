#!/usr/bin/env bash

set -ex

source .bluemix/config.sh

export COMPOSER_VERSION=0.19.5

function exit_on_error {
    if [ "$?" = "0" ]; then
        return 0
    fi

    message=${1:-${expected_error_message:-"Unexpected Error"}}

    echo "ERROR: ${message}" 1>&2

    if [ "$BLOCKCHAIN_SAMPLE_ID" != "" -a "$BLOCKCHAIN_URL" != "" ]; then
        request=$(jq -c -n \
            --arg app "$BLOCKCHAIN_SAMPLE_APP" \
            --arg url "$BLOCKCHAIN_SAMPLE_URL" \
            --arg msg "$message" \
            '{
                app: $app,
                completed_step: -1,
                url: $url,
                debug_msg: $msg
            }')

        do_curl \
            -X PUT \
            -H 'Content-Type: application/json' \
            -u ${BLOCKCHAIN_KEY}:${BLOCKCHAIN_SECRET} \
            --data-binary "$request" \
            ${BLOCKCHAIN_URL}/api/v1/networks/${BLOCKCHAIN_NETWORK_ID}/sample/${BLOCKCHAIN_SAMPLE_ID}
    fi

    exit 1
}

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
    npm install -g composer-cli@${COMPOSER_VERSION} @ampretia/composer-wallet-cloudant
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

install_jq

trap 'exit_on_error' ERR
