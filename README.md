<!-- [![Build Status](https://travis-ci.org/IBM/blockchainbean.svg?branch=master)](https://travis-ci.org/IBM/blockchainbean) -->

# Create a fair trade supply network with Hyperledger Composer and IBM Blockchain Starter Plan

In this Code Pattern we will create a blockchain app that increases visibility and efficiency in the supply chain of a coffee retailer. The private keys and credentials of the blockchain application will be stored on a Cloudant database. We will use different transactions to show different possible actions for the different participants in the supply chain. This sample application will record all transactions on the IBM Blockchain Starter Plan, and enable a coffee retailer to ensure the customer that their coffee is organic and fair-trade. The Code Pattern can be useful to developers that are looking into learning more about creating applications that mimic a food trust supply chain with Hyperledger Composer.

When the reader has completed this Code Pattern, they will understand how to:

* Interact with IBM Blockchain Starter Plan
* Build a blockchain back-end using Hyperledger Composer
* Create and use Cloudant NoSQL Database
* Deploy a Cloud Foundry application that writes and queries to the ledger

<!--Remember to dump an image in this path-->
![Architecture](/docs/app-architecture.png)

## Flow
1. The user deploys the app in IBM Cloud. The user submits transactions.
2. The transaction is submitted to the blockchain.
3. When the transaction conforms to the business logic, the data is written to the ledger.
4. A block is appended to our chain on the IBM Blockchain Starter Plan for the specific channel.
5. The user can query the blockchain for a particular asset, using the asset's unique id.

## Included components
* [IBM Blockchain Starter Plan](https://console.bluemix.net/catalog/services/blockchain): Use the IBM Blockchain Platform to simplify the developmental, governmental, and operational aspects of creating a blockchain solution.
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

<!-- <img src="https://i.makeagif.com/media/7-24-2018/MATtPg.gif" width="720" height="450" /> -->


<!-- ![fd](https://i.makeagif.com/media/7-24-2018/MATtPg.gif) -->

## Step 1/2: Create the toolchain

 ![packageFile](/docs/step12.gif)


1. Go to https://github.com/sstone1/blockchain-starter-kit. Go to step 2, and click on `Set up DevOps toolchain`.

2. Follow steps in the in the README to create your DevOps toolchain, and GitHub repository. At the end of this step you should have a toolchain with a github repo, and a delivery pipeline, as shown in the last part of step 2 of https://github.com/sstone1/blockchain-starter-kit. Just refresh the toolchain page, and you should see your toolchain have 3 parts - think, code, delivery, as shown in the gif below.  

## Step 3: Clone the repo

 ![packageFile](/docs/gitClone.gif)


3. Now we need to clone the repo we have just created. Click on the github button in the middle, which will take you to your new GitHub repo. Now, click on the green `clone or download` button on the right side of the page. This should give you a URL. Save this, you'll need it in the next step. Now in your terminal, find a place where you would like to start your project. In terminal, execute the following
```git clone https://github.com/<yourUsername/projectname>.git```

Go into your newly cloned repo. I called my bsk-horea-2.

```
$ cd bsk-horea-2
```

## Step 4: Use Yeoman to scaffold your project

 ![packageFile](/docs/yeoman.gif)

4. Now to the fun part, the smart contracts. Let's use Yeoman. 


```
$ npm install yeoman generator-hyperledger-composer
$ cd contracts
$ yo
```
```
$ -> `Hyperledger Composer`
$ -> `Business Network`
$ Business network name: `<your network name>`
$ Description: `<your description>`
$ Author Name: `your name`
$ Author Email: `<your email>`
$ License: `(Apache-2.0)`
$ Namespace: org.ibm.coffee
$ Do you want to generate an empty template network?: `Yes`
```

## Step 5: Add, commit, push smart contract code


 ![packageFile](/docs/packageJson.gif)

5. First, we need to modify some lines from your newly scaffoled application. Let's cut a few lines inside the `package.json` file. This is found in the
 `bsk-horea-2/contracts/package.json` file.
 
 Let's remove the lines that start with `pretest`, `lint`, and `test`.

 ![packageFile](/docs/pastePermissions.gif)

 Next, let's first clone the blockchain bean
directory.
```
$ git clone https://github.com/IBM/blockchainbean.git
```

Next, copy and paste the permissons.acl file from
 `blockchainbean/contracts/coffeeTrackr/permissions.acl`
and overwrite your permissons.acl file created from yeoman.

 ![packageFile](/docs/pushRest.gif)

Next, we'll copy the queries.qry file from 
`blockchainbean/contracts/coffeeTrackr/queries.qry` and paste it 
in our directory. We shouldn't have a `queries.qry` yet.

After that, let's rename our `bsk-horea-2/contracts/models/org.ibm.coffee.cto` file to 
`bsk-horea-2/contracts/models/model.cto`, and copy and paste that same file from the 
blockchainbean directory, as we have been doing.

The last file we need is `blockchainbean/contracts/coffeeTrackr/lib/logic.js` file, 
and we can just grab that and paste the contents in `bsk-horea-2/contracts/lib/logic.js`.

 ![packageFile](/docs/gitPush.gif)

Now, in terminal, let's push our code up to the GitHub repo with the following commands:
```
$ git add .
$ git commit -m "first commit"
$ git push origin master
```

## Step 6: Deploy your smart contract to IBM Blockchain Starter Plan

 ![packageFile](/docs/delivery.gif)

Now, we need to check our toolchain that we created in Step 2.

Let's go back to our GitHub repo that we just created. Click on the link that says
 `Created for Toolchain: ` in the title of the GitHub repo. You will be taken to your `IBM Cloud Toolchains` page.  

Click on the `Delivery` stage.

The pipeline should be triggered now. If it is not, simply go to it, and press the play button on the `Build` stage as shown in the gif. Next, wait for the pipeline to start.
If there are errors, you may want to check the logs by pressing the `View logs and history` option link on the `Build` stage.

 ![packageFile](/docs/cfApp.gif)
Once the app successfullys builds (you can check this with a simple page refresh), the `Deploy` stage should be triggered. Same as with the `Build` stage, you may want to check the logs if there are errors.

Let's check the logs of the `Deploy` stage by clicking the `View logs and history` button as shown in the gif. We can find the URL of our Cloud Foundry app 
by finding the `REST_SERVER_URLS` line, close to the bottom of the logs as shown in the gif. 

## Step 7: Post transactions and querying the Composer REST Server (Swagger UI)

Once you click on your application URL (this is your Cloud Foundry Node.js application), this will take you to your API documentation, or Swagger UI that was generated from the deployment scripts. The deployment scripts essentially created a Node.js Cloud Foundry instance that is connected to a IBM Blockchain Starter Plan instance. We won't go into too much detail here, but you can find more on Simon's repo.

![packageFile](/docs/API.gif)

Next, go to POST /pourCup, and then paste the following JSON in the data field as shown in the picture above. Click `Try it out!`.
```{ 
  "$class": "org.ibm.coffee.pourCup",
  "cupId": "CJB0119" 
}
```

Next, let's query our newly created cup, with our unique cupId. Click on `Query` and GET `/queries/getCupData` and enter in your cupId from above. Then click `Try it out!`.  You should see the relevant details registered from your recent POST call on `/pourCup`. Nice job! You successfully queried the blockchain.

## Step 8: Launch your IBM Blockchain Starter Plan service

![packageFile](/docs/launch1.gif)



Next, click on the IBM Cloud in the top left corner, and then use the search bar to find your blockchain service that you created from step 2. Click on it, and then on `Launch`. 

## Step 9: Inspect the blocks on our IBM Blockchain Starter Plan

 ![packageFile](/docs/5block.gif)

After we launch our IBM Blockchain Starter Plan, let's click on channels on the left-side of the page. You will be greeted with your `defaultchannel` and a dashboard of your blockchain. It will show you details such as number of blocks, time since the last transaction, and recent invokations. We can click on the blue arrow  to expand the details of our block. In this gif, we expland `BLOCK NUMBER 4`. We see the date and time of the transaction, the type of transaction, the UUID, the Chaincode ID and some other actions we can take. Let's click on the 3-dot symobol, under `ACTIONS` and then `View Details`. This will give you your block details. You will see even more specific details of your transaction here, such as the JSON object that is written to the ledger. Nice job! You successfully registered your transaction on the IBM Blockchain Platform! 👏🏼

 ![packageFile](/docs/2more.gif)

I'll quickly show you two more transactions in the gif above, mainly just to show you how fast your blocks are 
registered on the IBM Blockchain Starter Plan. 

Each time we make a POST request to /pourCup as shown in the gif above, we create a block on the blockchain. You can imagine using those /pourCup endpoints from the Composer REST Server instance with a mobile or web-ui. When certain button clicks or forms are submitted on that mobile or web-ui, each button click or form submission would trigger a POST request to our Composer Rest Server instance, and then trigger a block to be added to your blockchain on the IBM Blockchain Starter Plan service. 

Using these API endpoints you can create applications that leverage the industry standard for blockchain developers - Hyperledger Fabric. This pattern showed you how to build an app with 
Hyperledger Composer, deploy it onto the IBM Blockchain Starter Plan using a dev-ops toolchain. Our deployed app was simply a Swagger UI, with endpoints that perform CRUD (Create-read-update-delete) on a blockchain.     

Thank you for reading, I hope you enjoyed it. Go build something awesome! 🙌🏼

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

