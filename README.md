[![Build Status](https://travis-ci.org/IBM/blockchainbean.svg?branch=master)](https://travis-ci.org/IBM/blockchainbean)

# Create a fair trade supply network with Hyperledger Composer and IBM Blockchain Starter Plan

In this Code Pattern, we will create a blockchain app that increases visibility and efficiency in the supply chain of a coffee retailer. The private keys and credentials of the blockchain application will be stored Cloudant database. We will use different transactions to show different possible actions for the different participants in the supply chain. This sample application will record all transactions on the IBM Blockchain Starter Kit, and enable a coffee retailer to ensure the customer that their coffee is organic and fair-trade. The Code Pattern can be useful to developers that are looking into learning more about creating applications that mimic a food trust supply chain with Hyperledger Composer.

When the reader has completed this Code Pattern, they will understand how to:

* Interact with IBM Blockchain Starter Kit
* Build a blockchain back-end using Hyperledger Composer
* Create and use Cloudant NoSQL Database
* Deploy a Cloud Foundry application that writes to the ledger

<!--Remember to dump an image in this path-->
<!-- ![Architecture](/docs/app-architecture.png) -->

## Flow
1. The user deploys the app in IBM Cloud. The user submits transactions.
2. The transaction is subbmitted to the ordering service.
3. When the transaction conforms to the business logic, the data is written to the ledger.
4. The another block is added to our chain on the IBM Blockchain Starter Kit for the specific channel.

## Included components
* [IBM Blockchain Starter Kit](https://www.ibm.com/watson/services/natural-language-understanding/):  Create a blockchain using ....
* [Cloudant NoSQL DB](https://console.ng.bluemix.net/catalog/services/cloudant-nosql-db): A fully managed data layer designed for modern web and mobile applications that leverages a flexible JSON schema.

## Featured technologies
* [Blockchain](https://nodejs.org/): An open-source JavaScript run-time environment for executing server-side JavaScript code.
* [Databases](https://en.wikipedia.org/wiki/IBM_Information_Management_System#.22Full_Function.22_databases): Repository for storing and managing collections of data.
* [Cloud](https://www.ibm.com/developerworks/learn/cloud/): Accessing computer and information technology resources through the Internet.

## Watch the Video

<!-- [![](docs/youtubePicture.png)](https://www.youtube.com/watch?v=wwNAEvbxd54&list=PLVztKpIRxvQXhHlMQttCfYZrDN8aELnzP&index=1&t=1s) -->

# Steps

Use the ``Deploy to IBM Cloud`` button **OR** create the services and run locally.

## Deploy to IBM Cloud
If you do not have an IBM Cloud account yet, you will need to create one [here](https://ibm.biz/BdjLxy).

<!-- [![Deploy to IBM Cloud](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/IBM/watson-second-opinion) -->

# Learn more

<!-- * **Blockchain Code Patterns**: Enjoyed this Code Pattern? Check out our other [Node.js Code Patterns](https://developer.ibm.com/code/technologies/node-js/) -->


# License
[Apache 2.0](LICENSE)
