#!/usr/bin/env bash

set -ex

source .bluemix/pipeline-COMMON.sh

export CONTRACTS=$(ls contracts)
export APPS=$(ls apps)
if ls contracts/*/package.json > /dev/null 2>&1
then
    export HAS_COMPOSER_CONTRACTS=true
fi

function test_contracts {
    for CONTRACT in ${CONTRACTS}
    do
        test_contract ${CONTRACT}
    done
}

function test_contract {
    CONTRACT=$1
    if [ -f contracts/${CONTRACT}/package.json ]
    then
        test_composer_contract ${CONTRACT}
    elif ls contracts/${CONTRACT}/*.go > /dev/null 2>&1
    then
        test_fabric_contract ${CONTRACT}
    else
        echo unrecognized contract type ${CONTRACT}
        exit 1
    fi
}

function test_composer_contract {
    CONTRACT=$1
    echo testing composer contract ${CONTRACT}
    pushd contracts/${CONTRACT}
    npm install
    npm test
    rm -rf node_modules
    popd
}

function test_fabric_contract {
    CONTRACT=$1
    echo testing fabric contract ${CONTRACT}
    GIT_CC_HASH=$(git ls-tree --abbrev=12 HEAD contracts/${CONTRACT} | awk '{print $3}')
    pushd contracts/${CONTRACT}
    echo CHAINCODE_ID=${CONTRACT} > version.env
    echo CHAINCODE_VERSION=${GIT_CC_HASH} >> version.env
    popd
}

function test_apps {
    for APP in ${APPS}
    do
        test_app ${APP}
    done
}

function test_app {
    APP=$1
    if [ -f apps/${APP}/package.json ]
    then
        test_node_app ${APP}
    else
        echo unrecognized app type ${APP}
        exit 1
    fi
}

function test_node_app {
    CONTRACT=$1
    echo testing node.js app ${CONTRACT}
    pushd apps/${CONTRACT}
    npm install
    # npm test
    SCRIPTS="prepublish prepare prepublishOnly prepack"
    for SCRIPT in ${SCRIPTS}
    do
        if jq -e ".scripts.${SCRIPT}" package.json > /dev/null 2>&1
        then
            npm run ${SCRIPT}
        fi
    done
    rm -rf node_modules
    popd
}

install_nodejs
test_contracts
test_apps
