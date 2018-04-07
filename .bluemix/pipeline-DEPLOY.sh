#!/usr/bin/env bash

set -ex

source .bluemix/pipeline-COMMON.sh
source .bluemix/pipeline-CLOUDANT.sh
source .bluemix/pipeline-BLOCKCHAIN.sh

export CONTRACTS=$(ls contracts)
export APPS=$(ls apps)
if ls contracts/*/package.json > /dev/null 2>&1
then
    export HAS_COMPOSER_CONTRACTS=true
fi
export REST_SERVER_URLS={}

function deploy_contracts {
    for CONTRACT in ${CONTRACTS}
    do
        deploy_contract ${CONTRACT}
    done
}

function deploy_contract {
    CONTRACT=$1
    if [ -f contracts/${CONTRACT}/package.json ]
    then
        deploy_composer_contract ${CONTRACT}
        deploy_composer_rest_server ${CONTRACT}
    elif ls contracts/${CONTRACT}/*.go > /dev/null 2>&1
    then
        deploy_fabric_contract ${CONTRACT}
    else
        echo unrecognized contract type ${CONTRACT}
        exit 1
    fi
}

function deploy_composer_contract {
    CONTRACT=$1
    echo deploying composer contract ${CONTRACT}
    pushd contracts/${CONTRACT}
    BUSINESS_NETWORK_NAME=$(jq --raw-output '.name' package.json)
    BUSINESS_NETWORK_VERSION=$(jq --raw-output '.version' package.json)
    BUSINESS_NETWORK_ARCHIVES=$(ls dist/*.bna)
    BUSINESS_NETWORK_CARD=admin@${BUSINESS_NETWORK_NAME}
    for BUSINESS_NETWORK_ARCHIVE in ${BUSINESS_NETWORK_ARCHIVES}
    do
        if ! OUTPUT=$(composer network install -c ${BLOCKCHAIN_NETWORK_CARD} -a ${BUSINESS_NETWORK_ARCHIVES} 2>&1)
        then
            if [[ "${OUTPUT}" != *"already installed"* ]]
            then
                echo failed to install composer contract ${CONTRACT}
                exit 1
            fi
        fi
        while ! OUTPUT=$(composer network start -c ${BLOCKCHAIN_NETWORK_CARD} -n ${BUSINESS_NETWORK_NAME} -V ${BUSINESS_NETWORK_VERSION} -A ${BLOCKCHAIN_NETWORK_ENROLL_ID} -S ${BLOCKCHAIN_NETWORK_ENROLL_SECRET} -f adminCard.card 2>&1)
        do
            if [[ "${OUTPUT}" = *"REQUEST_TIMEOUT"* ]]
            then
                sleep 30
            elif [[ "${OUTPUT}" = *"chaincode exists"* ]]
            then
                BUSINESS_NETWORK_UPGRADE=true
                break
            else
                echo failed to start composer contract ${CONTRACT}
                exit 1
            fi
        done
        if [[ "${BUSINESS_NETWORK_UPGRADE}" = "true" ]]
        then
            while ! OUTPUT=$(composer network upgrade -c ${BLOCKCHAIN_NETWORK_CARD} -n ${BUSINESS_NETWORK_NAME} -V ${BUSINESS_NETWORK_VERSION} 2>&1)
            do
                if [[ "${OUTPUT}" = *"REQUEST_TIMEOUT"* ]]
                then
                    sleep 30
                else
                    echo failed to upgrade composer contract ${CONTRACT}
                    exit 1
                fi
            done
        else
            if composer card list -c ${BUSINESS_NETWORK_CARD} > /dev/null 2>&1
            then
                composer card delete -c ${BUSINESS_NETWORK_CARD}
            fi
            composer card import -f adminCard.card -c ${BUSINESS_NETWORK_CARD}
        fi
        composer network ping -c ${BUSINESS_NETWORK_CARD}
    done
    popd
}

function deploy_composer_rest_server {
    CONTRACT=$1
    echo deploying composer rest server ${CONTRACT}
    pushd contracts/${CONTRACT}
    BUSINESS_NETWORK_NAME=$(jq --raw-output '.name' package.json)
    BUSINESS_NETWORK_CARD=admin@${BUSINESS_NETWORK_NAME}
    CF_APP_NAME=composer-rest-server-${BUSINESS_NETWORK_NAME}
    cf push \
        ${CF_APP_NAME} \
        --docker-image sstone1/composer-rest-server \
        -i 1 \
        -m 256M \
        --no-start \
        --no-manifest
    cf set-env ${CF_APP_NAME} NODE_CONFIG "${NODE_CONFIG}"
    cf set-env ${CF_APP_NAME} COMPOSER_CARD ${BUSINESS_NETWORK_CARD}
    cf set-env ${CF_APP_NAME} COMPOSER_NAMESPACES required
    cf set-env ${CF_APP_NAME} COMPOSER_WEBSOCKETS true
    cf start ${CF_APP_NAME}
    REST_SERVER_URL=$(cf app ${CF_APP_NAME} | grep routes: | awk '{print $2}')
    export REST_SERVER_URLS=$(echo ${REST_SERVER_URLS} | jq ". + {\"${BUSINESS_NETWORK_NAME}\":\"https://${REST_SERVER_URL}\"}")
    popd
}

function deploy_fabric_contract {
    CONTRACT=$1
    echo deploying fabric contract ${CONTRACT}
    pushd contracts/${CONTRACT}
    source version.env
    CHAINCODE_FILES=$(find . -name "*.go")
    CHAINCODE_FILE_OPTS=""
    CHANNEL=defaultchannel
    for CHAINCODE_FILE in ${CHAINCODE_FILES}
    do
        CHAINCODE_FILE_OPTS="${CHAINCODE_FILE_OPTS} -F files[]=@${CHAINCODE_FILE}"
    done
    if ! OUTPUT=$(do_curl -X POST -u ${BLOCKCHAIN_KEY}:${BLOCKCHAIN_SECRET} ${CHAINCODE_FILE_OPTS} -F chaincode_id=${CHAINCODE_ID} -F chaincode_version=${CHAINCODE_VERSION} ${BLOCKCHAIN_URL}/api/v1/networks/${BLOCKCHAIN_NETWORK_ID}/chaincode/install)
    then
        if [[ "${OUTPUT}" != *"chaincode code"*"exists"* ]]
        then
            echo failed to install fabric contract ${CONTRACT}
            exit 1
        fi
    fi
    cat << EOF > request.json
{
    "chaincode_id": "${CHAINCODE_ID}",
    "chaincode_version": "${CHAINCODE_VERSION}",
    "chaincode_arguments": "[\"12345\"]"
}
EOF
    while ! OUTPUT=$(do_curl -X POST -H 'Content-Type: application/json' -u ${BLOCKCHAIN_KEY}:${BLOCKCHAIN_SECRET} --data-binary @request.json ${BLOCKCHAIN_URL}/api/v1/networks/${BLOCKCHAIN_NETWORK_ID}/channels/${CHANNEL}/chaincode/instantiate)
    do
        if [[ "${OUTPUT}" = *"Failed to establish a backside connection"* ]]
        then
            sleep 30
        elif [[ "${OUTPUT}" = *"premature execution"* ]]
        then
            sleep 30
        elif [[ "${OUTPUT}" = *"version already exists for chaincode"* ]]
        then
            break
        else
            echo failed to start fabric contract ${CONTRACT}
            exit 1
        fi
    done
    rm -f request.json
    popd
}

function deploy_apps {
    for APP in ${APPS}
    do
        deploy_app ${APP}
    done
}

function deploy_app {
    APP=$1
    if [ -f apps/${APP}/manifest.yml ]
    then
        deploy_cf_app ${APP}
    elif [ -f apps/${APP}/Dockerfile ]
    then
        deploy_docker_app ${APP}
    else
        echo unrecognized app type ${APP}
        exit 1
    fi
}

function deploy_cf_app {
    APP=$1
    echo deploying cloud foundry app ${APP}
    pushd apps/${APP}
    cf push ${APP} -i 1 -m 128M --no-start
    cf set-env ${APP} REST_SERVER_URLS "${REST_SERVER_URLS}"
    cf bind-service ${APP} ${BLOCKCHAIN_SERVICE_INSTANCE} -c '{"permissions":"read-only"}'
    cf start ${APP}
    popd
}

function deploy_docker_app {
    APP=$1
    echo deploying docker app ${APP}
    pushd apps/${APP}
    echo cannot deploy docker apps just yet
    popd
}

install_nodejs
install_jq
if [[ "${HAS_COMPOSER_CONTRACTS}" = "true" ]]
then
    install_composer
    provision_cloudant
    create_cloudant_database
    configure_composer_wallet
fi
provision_blockchain
if [[ "${HAS_COMPOSER_CONTRACTS}" = "true" ]]
then
    create_blockchain_network_card
fi
deploy_contracts
deploy_apps
