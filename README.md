<!-- [![Build Status](https://travis-ci.org/IBM/blockchainbean.svg?branch=master)](https://travis-ci.org/IBM/blockchainbean) -->

# Create a fair trade supply network with Hyperledger Composer and IBM Blockchain Starter Plan

In this Code Pattern we will create a blockchain app that increases visibility and efficiency in the supply chain of a coffee retailer. The private keys and credentials of the blockchain application will be stored on a Cloudant database. We will use different transactions to show different possible actions for the different participants in the supply chain. This sample application will record all transactions on the IBM Blockchain Starter Kit, and enable a coffee retailer to ensure the customer that their coffee is organic and fair-trade. The Code Pattern can be useful to developers that are looking into learning more about creating applications that mimic a food trust supply chain with Hyperledger Composer.

When the reader has completed this Code Pattern, they will understand how to:

* Interact with IBM Blockchain Starter Kit
* Build a blockchain back-end using Hyperledger Composer
* Create and use Cloudant NoSQL Database
* Deploy a Cloud Foundry application that writes and queries to the ledger

<!--Remember to dump an image in this path-->
![Architecture](/docs/app-architecture.png)

## Flow
1. The user deploys the app in IBM Cloud. The user submits transactions.
2. The transaction is submitted to the blockchain.
3. When the transaction conforms to the business logic, the data is written to the ledger.
4. A block is appended to our chain on the IBM Blockchain Starter Kit for the specific channel.
5. The user can query the blockchain for a particular asset, using the asset's unique id.

## Included components
* [IBM Blockchain Starter Kit](https://console.bluemix.net/catalog/services/blockchain): Use the IBM Blockchain Platform to simplify the developmental, governmental, and operational aspects of creating a blockchain solution.
* [Cloudant NoSQL DB](https://console.ng.bluemix.net/catalog/services/cloudant-nosql-db): A fully managed data layer designed for modern web and mobile applications that leverages a flexible JSON schema.

## Featured technologies
* [IBM Blockchain](https://www.ibm.com/blockchain): Blockchain is a shared, immutable ledger for recording the history of transactions.
* [Databases](https://en.wikipedia.org/wiki/IBM_Information_Management_System#.22Full_Function.22_databases): Repository for storing and managing collections of data.
* [Cloud](https://www.ibm.com/developerworks/learn/cloud/): Accessing computer and information technology resources through the Internet.

<!-- ## Watch the Video -->

<!-- [![](docs/youtubePicture.png)](https://www.youtube.com/watch?v=wwNAEvbxd54&list=PLVztKpIRxvQXhHlMQttCfYZrDN8aELnzP&index=1&t=1s) -->
# Prerequisites
1. If you do not have an IBM Cloud account yet, you will need to create one [here](https://ibm.biz/BdjLxy).

2. Yeoman, to generate app skeleton.
```npm install -g yo```

# Steps

In this code pattern, we will use the blockchain-starter-kit repository: https://github.com/sstone1/blockchain-starter-kit to
deploy our smart contract to the cloud. This repo will help us create a DevOps toolchain to automate deployment.

![fd](https://i.makeagif.com/media/7-24-2018/MATtPg.gif)

1. Go to https://github.com/sstone1/blockchain-starter-kit. Go to step 2, and click on `Set up DevOps toolchain`.


![toolchain](https://i.makeagif.com/media/7-23-2018/4jgYbH.gif)

![medium](https://i.makeagif.com/media/7-24-2018/rsJHEa.gif)

<img src="https://i.makeagif.com/media/7-24-2018/rsJHEa.gif" width="400" height="400" />


2. Follow steps in the in the README to create your DevOps toolchain, and GitHub repository. At the end of this step you should have a toolchain with a github repo, and a delivery pipeline, as shown in the last part of step 2 of https://github.com/sstone1/blockchain-starter-kit. 

![git clone](https://i.makeagif.com/media/7-24-2018/hwM4I_.gif)

3. Now we need to clone the repo we have just created. Click on the github button in the middle, which will take you to your new GitHub repo. Now, click on the green `clone or download` button on the right side of the page. This should give you a URL. Save this, you'll need it in the next step. Now in your terminal, find a place where you would like to start your project.
5. In terminal, execute the following
```git clone https://github.com/<yourUsername/projectname>.git```
6. Now you should have a project structure ready. Woo! Halfway there!
7. Now to the fun part, the smart contracts. Let's us use Yeoman. 
```
$ cd contracts
$ yo
```
Select `Hyperledger Composer`
Select `Business Network`
Business network name: `coffeetracker`
Description: `demo`
Author Name: `Horea`
Author Email: `Horea@email`
License: `(Apache-2.0)`
Namespace: `org.ibm.coffee`

8. Your folder structure should now be created. Go into your smart contract directory. We will now copy over the smart contract code from our code pattern. But first, we remove some content we don't need yet.

``` 
 $ cd contracts/coffeetracker
 ```

 

 ![packageFile](/docs/packageFile.png)

 9. Now, inside the `package.json` file, remove the lines that start with `pretest`, `lint`, and `test`. Then, remove the `test` and the `features` directory as shown above. Then, we will need to paste some code from the code pattern.

 10. Copy over the smart contract code from https://github.com/IBM/blockchainbean. 

 10. Rename `models/ibm.coffee.cto` to `model.cto`
 
 11. Let's copy the code from the following URLs: the model file, https://github.com/IBM/blockchainbean/blob/master/contracts/coffeeTrackr/models/model.cto, the logic file,
 https://github.com/IBM/blockchainbean/blob/master/contracts/coffeeTrackr/lib/logic.js, 
 and the permissions file: https://github.com/IBM/blockchainbean/blob/master/contracts/coffeeTrackr/permissions.acl. 
12. Create a new file called `queries.qry`, and paste in the code from here: https://github.com/IBM/blockchainbean/blob/master/contracts/coffeeTrackr/queries.qry. 


13. Now, in terminal, let's push our code up to the GitHub repo with the following commands:
```
$ git add .
$ git commit -m "first commit"
$ git push origin master
```

14. Now, once the delivery pipline finishes, you will have a working Node.js Cloud Foundry instance. To find this, click on `IBM Cloud` in the top left corner to take you back to your applications. 

 ![packageFile](/docs/cloudFoundry.png)
15. Find the application starting with composer-rest-server<your-smart-contract-name-here>. It should start with the name `composer-rest-server` as shown in red above. Click it and then click `visit App url`.

![pourCup](/docs/pourCup.png)
16. Next, go to POST /pourCup, and then paste the following JSON in the data field as shown in the picture above. Click `Try it out!`.
```{ 
  "$class": "org.ibm.coffee.pourCup",
  "cupId": "CJB0119" 
}
```

![blockchainService](/docs/blockchainService.png)
17. Next, find your blockchain service. Click on it, and click on `Enter Monitor`. Then click on channels, and then on the first block. You should see something like the picture above. This should be your latest transaction, and should have your chaincodeId, which is just what you named your smart contract. Nice job! You successfully registered your transaction on the IBM Blockchain Platform! 👏🏼

![blockchainService](/docs/getCupCoffee.png)
18. Let's go back to our Cloud foundry app. Let's click on GET /cupCoffee. Note that the `cupId` that you see there. Now, let's go to our queries. Click on `Query` and GET `getCupData`. Enter in your cupId from above. You should see the relevant details registered from your post call in step 19 above. Nice job! You successfully queried the blockchain.

19. Using these API endpoints you can start building web and mobile applications that call
these endpoints to perform CRUD operations on the blockchain. 

Thank you for reading, and go build something awesome!






<!-- ## Deploy to IBM Cloud -->


<!-- [![Deploy to IBM Cloud](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/IBM/watson-second-opinion) -->
# Links

* [IBM Blockchain - Marbles demo](https://github.com/IBM-Blockchain/marbles)
* [Hyperledger Composer](https://hyperledger.github.io/composer/latest/index.html)


# Learn more

* **Blockchain Code Patterns**: Enjoyed this Code Pattern? Check out our other [Blockchain Code Patterns](https://developer.ibm.com/code/technologies/blockchain/)

* **Blockchain 101**: Learn why IBM believes that blockchain can transform businesses, industries – and even the world. [Blockchain 101](https://developer.ibm.com/code/technologies/blockchain/)

# License
[Apache 2.0](LICENSE)

