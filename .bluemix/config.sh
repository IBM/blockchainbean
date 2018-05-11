#!/usr/bin/env bash

set -ex

# Set this to the name of the sample recognized by the IBM Blockchain Platform. Samples must be registered by the
# IBM team who manage the IBM Blockchain Platform service; you cannot register samples yourself at this time.
# export BLOCKCHAIN_SAMPLE_ID=your-sample

# Set this to the name of an application under the apps directory. The URL of this application will be linked
# to from the IBM Blockchain Platform. If you want to explicitly set this URL, specify it in BLOCKCHAIN_SAMPLE_URL.
# export BLOCKCHAIN_SAMPLE_APP=your-app

# Set this to a hardcoded URL of the application you want to be linked to from the IBM Blockchain Platform.
# If this is not set, it will be set to the URL of the application specified in BLOCKCHAIN_SAMPLE_APP.
# export BLOCKCHAIN_SAMPLE_URL=