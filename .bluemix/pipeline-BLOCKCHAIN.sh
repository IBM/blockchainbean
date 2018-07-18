#!/usr/bin/env bash

set -ex

source .bluemix/pipeline-COMMON.sh

export BLOCKCHAIN_SERVICE_NAME=ibm-blockchain-5-prod
export BLOCKCHAIN_SERVICE_PLAN=ibm-blockchain-plan-v1-ga1-starter-prod
export BLOCKCHAIN_SERVICE_KEY=Credentials-1
export BLOCKCHAIN_NETWORK_CARD=admin@blockchain-network

function provision_blockchain {
    if ! cf service ${BLOCKCHAIN_SERVICE_INSTANCE} > /dev/null 2>&1
    then
        cf create-service ${BLOCKCHAIN_SERVICE_NAME} ${BLOCKCHAIN_SERVICE_PLAN} ${BLOCKCHAIN_SERVICE_INSTANCE}
    fi
    if ! cf service-key ${BLOCKCHAIN_SERVICE_INSTANCE} ${BLOCKCHAIN_SERVICE_KEY} > /dev/null 2>&1
    then
        cf create-service-key ${BLOCKCHAIN_SERVICE_INSTANCE} ${BLOCKCHAIN_SERVICE_KEY}
    fi
    cf service-key ${BLOCKCHAIN_SERVICE_INSTANCE} ${BLOCKCHAIN_SERVICE_KEY} | tail -n +2 > blockchain.json
    export BLOCKCHAIN_NETWORK_ID=$(jq --raw-output '.org1."network_id"' blockchain.json)
    export BLOCKCHAIN_KEY=$(jq --raw-output '.org1.key' blockchain.json)
    export BLOCKCHAIN_SECRET=$(jq --raw-output '.org1.secret' blockchain.json)
    export BLOCKCHAIN_URL=$(jq --raw-output '.org1.url' blockchain.json)
}

function get_blockchain_connection_profile_inner {
    do_curl \
        -H 'Content-Type: application/json' \
        -H 'Accept: application/json' \
        -u ${BLOCKCHAIN_KEY}:${BLOCKCHAIN_SECRET} \
        ${BLOCKCHAIN_URL}/api/v1/networks/${BLOCKCHAIN_NETWORK_ID}/connection_profile > blockchain-connection-profile.json
}

function get_blockchain_connection_profile {
    get_blockchain_connection_profile_inner
    while ! jq -e ".channels.defaultchannel" blockchain-connection-profile.json
    do
        sleep 10
        get_blockchain_connection_profile_inner
    done
}

function wait_for_peer_to_start {
    PEER=$1
    PEER_STATUS="not running"
    while [[ "$PEER_STATUS" != "running" ]]
    do
        sleep 10
        STATUS=$(do_curl -H 'Accept: application/json' -u ${BLOCKCHAIN_KEY}:${BLOCKCHAIN_SECRET} ${BLOCKCHAIN_URL}/api/v1/networks/${BLOCKCHAIN_NETWORK_ID}/nodes/status)
        PEER_STATUS=$(echo ${STATUS} | jq --raw-output ".[\"${PEER}\"].status")
    done
}

function start_blockchain_peer {
    PEER=$1
    do_curl \
        -X POST \
        -H 'Accept: application/json' \
        -u ${BLOCKCHAIN_KEY}:${BLOCKCHAIN_SECRET} \
        ${BLOCKCHAIN_URL}/api/v1/networks/${BLOCKCHAIN_NETWORK_ID}/nodes/${PEER}/start
    wait_for_peer_to_start ${PEER}
}

function wait_for_peer_to_stop {
    PEER=$1
    PEER_STATUS="running"
    while [[ "$PEER_STATUS" = "running" ]]
    do
        sleep 10
        STATUS=$(do_curl -H 'Accept: application/json' -u ${BLOCKCHAIN_KEY}:${BLOCKCHAIN_SECRET} ${BLOCKCHAIN_URL}/api/v1/networks/${BLOCKCHAIN_NETWORK_ID}/nodes/status)
        PEER_STATUS=$(echo ${STATUS} | jq --raw-output ".[\"${PEER}\"].status")
    done
}

function stop_blockchain_peer {
    PEER=$1
    do_curl \
        -X POST \
        -H 'Accept: application/json' \
        -u ${BLOCKCHAIN_KEY}:${BLOCKCHAIN_SECRET} \
        ${BLOCKCHAIN_URL}/api/v1/networks/${BLOCKCHAIN_NETWORK_ID}/nodes/${PEER}/stop
    wait_for_peer_to_stop ${PEER}
}

function restart_blockchain_peer {
    PEER=$1
    stop_blockchain_peer ${PEER}
    start_blockchain_peer ${PEER}
}

function request_admin_cert {
    composer card create -f ca.card -p blockchain-connection-profile.json -u ${BLOCKCHAIN_NETWORK_ENROLL_ID} -s ${BLOCKCHAIN_NETWORK_ENROLL_SECRET}
    composer card import -f ca.card -c ca
    rm -f ca.card
    composer identity request -c ca -d ./credentials
    composer card delete -c ca
}

function upload_admin_cert {
    MSPID=$(jq --raw-output 'limit(1; .organizations[].mspid)' blockchain-connection-profile.json)
    cat << EOF > request.json
{
    "msp_id": "${MSPID}",
    "adminCertName": "${IDS_PROJECT_NAME}",
    "adminCertificate": "$(cat ./credentials/${BLOCKCHAIN_NETWORK_ENROLL_ID}-pub.pem | tr '\n' '~' | sed 's/~/\\r\\n/g')"
}
EOF
    do_curl \
        -X POST \
        -H 'Content-Type: application/json' \
        -H 'Accept: application/json' \
        -u ${BLOCKCHAIN_KEY}:${BLOCKCHAIN_SECRET} \
        --data-binary @request.json \
        ${BLOCKCHAIN_URL}/api/v1/networks/${BLOCKCHAIN_NETWORK_ID}/certificates
    rm -f request.json
}

function sync_channel_certs {
    CHANNEL=$1
    do_curl \
        -X POST \
        -H 'Accept: application/json' \
        -u ${BLOCKCHAIN_KEY}:${BLOCKCHAIN_SECRET} \
        ${BLOCKCHAIN_URL}/api/v1/networks/${BLOCKCHAIN_NETWORK_ID}/channels/${CHANNEL}/sync
}

function create_blockchain_network_card {
    get_blockchain_connection_profile
    export BLOCKCHAIN_NETWORK_ENROLL_ID=$(jq --raw-output 'limit(1;.certificateAuthorities[].registrar[0].enrollId)' blockchain-connection-profile.json)
    export BLOCKCHAIN_NETWORK_ENROLL_SECRET=$(jq --raw-output 'limit(1;.certificateAuthorities[].registrar[0].enrollSecret)' blockchain-connection-profile.json)
    export BLOCKCHAIN_NETWORK_CARD=${BLOCKCHAIN_NETWORK_ENROLL_ID}@blockchain-network
    if ! composer card list -c ${BLOCKCHAIN_NETWORK_CARD} > /dev/null 2>&1
    then
        request_admin_cert
        upload_admin_cert
        PEER=$(jq --raw-output 'limit(1; .organizations[].peers[0])' blockchain-connection-profile.json)
        restart_blockchain_peer ${PEER}
        CHANNEL=defaultchannel
        sync_channel_certs ${CHANNEL}
        composer card create -f adminCard.card -p blockchain-connection-profile.json -u ${BLOCKCHAIN_NETWORK_ENROLL_ID} -c ./credentials/${BLOCKCHAIN_NETWORK_ENROLL_ID}-pub.pem -k ./credentials/${BLOCKCHAIN_NETWORK_ENROLL_ID}-priv.pem -r PeerAdmin -r ChannelAdmin
        composer card import -f adminCard.card -c ${BLOCKCHAIN_NETWORK_CARD}
        rm -f adminCard.card
    fi
}

function update_blockchain_deploy_status {
    COMPLETED_STEP=$1
    if [[ "${BLOCKCHAIN_SAMPLE_ID}" = "" ]]
    then
        echo trying to update blockchain deploy status but no sample id specified
        return 0
    fi
    echo updating blockchain deploy status to ${COMPLETED_STEP} at $(date)
    cat << EOF > request.json
{
    "app": "${BLOCKCHAIN_SAMPLE_APP}",
    "completed_step": "${COMPLETED_STEP}",
    "url": "${BLOCKCHAIN_SAMPLE_URL}"
}
EOF
    do_curl \
        -X PUT \
        -H 'Content-Type: application/json' \
        -u ${BLOCKCHAIN_KEY}:${BLOCKCHAIN_SECRET} \
        --data-binary @request.json \
        ${BLOCKCHAIN_URL}/api/v1/networks/${BLOCKCHAIN_NETWORK_ID}/sample/${BLOCKCHAIN_SAMPLE_ID}
    rm -f request.json
}
