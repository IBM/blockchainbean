# blockchain-starter-kit

A project to track coffee while it makes it's way through the supply chain. Below is a description of how to get started testing the network.

1. [Create participants](#1-create-participants)
2. [Create assets (coffee)](#2-create-assets)
3. [Transfer assets (coffee)](#3-transfer-assets)

## 1. Create participants 


To test the network, first create (POST) a 'Grower' participant with the following json:

`
{
  "$class": "org.ibm.coffee.Grower",
  "isFairTrade": false,
  "growerId": "growerA",
  "organization": "IBM",
  "address": {
    "$class": "org.ibm.coffee.Address",
    "country": ""
  },
  "balance": 0,
  "batches": []
}
`

Then create (POST) a 'Importer' participant with the following json:

`{
  "$class": "org.ibm.coffee.Importer",
  "importerId": "importerA",
  "organization": "Oracle",
  "address": {
    "$class": "org.ibm.coffee.Address",
    "country": ""
  },
  "balance": 0,
  "batches": []
}`

## 2. Create assets


Now that we have a grower and a importer, we can add a batch of coffee. POST an 'addCoffee' transaction, and add the following json: 

`{
  "$class": "org.ibm.coffee.addCoffee",
  "size": "SMALL",
  "roast": "LIGHT",
  "batchState": "READY_FOR_DISTRIBUTION",
  "batchId": "9mf2sg8cd",
  "grower": "resource:org.ibm.coffee.Grower#9243"
}`

Next, let's grab the batchId by doing a GET on the coffee asset: 9mf2sg8cd

## 3. Transfer assets


Next, let's transfer the batch '9mf2sg8cd' from the grower to the importer. POST a 'transferCoffee' transaction with the following json:

`{
  "$class": "org.ibm.coffee.transferCoffee",
  "newOwner": "resource:org.ibm.coffee.Importer#importerA",
  "oldOwner": "resource:org.ibm.coffee.Grower#growerA",
  "batchId": "9mf2sg8cd",
  "newOwnerType": "importer"
}`

Cool. Now the coffee's owner is changed to importerA. 

Let's query for all of the transactions associated with batch '9mf2sg8cd'.

Let's do a GET query for 'query/getBatchHistory' and for the batchId fill in '9mf2sg8cd'.

You should see something like this: 

 `{
    "$class": "org.ibm.coffee.transferCoffee",
    "newOwner": "resource:org.ibm.coffee.Importer#importerA",
    "oldOwner": "resource:org.ibm.coffee.Grower#growerA",
    "batchId": "9mf2sg8cd",
    "newOwnerType": "importer",
    "transactionId": "9587a741f7a483d9b006f97758d75004c1fa64b8d8e783b2e9017f2d1a465783",
    "timestamp": "2018-05-25T00:19:27.873Z"
  }`
  
  Cool. Now you can imagine that when we create a regulator and a retailer, and we transfer the coffee to them, the last query would have 3 transactions instead, showing that the coffee has passed through not only the importer, but the regulator and reatailer as well.
  
  *********************** WIP **********************************
