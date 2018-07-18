#!/usr/bin/env bash

set -ex

source .bluemix/pipeline-COMMON.sh

export CLOUDANT_SERVICE_NAME=cloudantNoSQLDB
export CLOUDANT_SERVICE_PLAN=Lite
export CLOUDANT_SERVICE_KEY=Credentials-1
export CLOUDANT_DATABASE=wallet

function provision_cloudant {
    if ! cf service ${CLOUDANT_SERVICE_INSTANCE} > /dev/null 2>&1
    then
        cf create-service ${CLOUDANT_SERVICE_NAME} ${CLOUDANT_SERVICE_PLAN} ${CLOUDANT_SERVICE_INSTANCE}
    fi
    if ! cf service-key ${CLOUDANT_SERVICE_INSTANCE} ${CLOUDANT_SERVICE_KEY} > /dev/null 2>&1
    then
        cf create-service-key ${CLOUDANT_SERVICE_INSTANCE} ${CLOUDANT_SERVICE_KEY}
    fi
    cf service-key ${CLOUDANT_SERVICE_INSTANCE} ${CLOUDANT_SERVICE_KEY} | tail -n +2 > cloudant.json
    export CLOUDANT_URL=$(jq --raw-output '.url' cloudant.json)
    export CLOUDANT_CREDS=$(jq ". + {database: \"${CLOUDANT_DATABASE}\"}" cloudant.json)
}

function create_cloudant_database {
    if ! do_curl ${CLOUDANT_URL}/${CLOUDANT_DATABASE} > /dev/null 2>&1
    then
        do_curl -X PUT ${CLOUDANT_URL}/${CLOUDANT_DATABASE}
    fi
}

function configure_composer_wallet {
    read -d '' NODE_CONFIG << EOF || true
    {"composer":{"wallet":{"type":"@ampretia/composer-wallet-cloudant","desc":"Uses cloud wallet","options":${CLOUDANT_CREDS}}}}
EOF
    export NODE_CONFIG
}