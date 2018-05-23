# blockchain-starter-kit

A project to track coffee while it makes it's way through the supply chain.

To test the network, first create (POST) a 'Grower' participant with the following json:

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

Then create (POST) a 'Importer' participant with the following json:

{
  "$class": "org.ibm.coffee.Importer",
  "importerId": "importerA",
  "organization": "Oracle",
  "address": {
    "$class": "org.ibm.coffee.Address",
    "country": ""
  },
  "balance": 0,
  "batches": []
}

Now that we have a grower and aa importer, we can add a batch of coffee. POST an 'addCoffee' transaction, and add the following json: 

{
  "$class": "org.ibm.coffee.addCoffee",
  "size": "SMALL",
  "roast": "LIGHT",
  "batchState": "READY_FOR_DISTRIBUTION",
  "grower": "resource:org.ibm.coffee.Grower#growerA"
}

Next, let's grab the batchId by doing a GET on the coffee asset: 9mf2sg8cd

Next, let's transfer the batch '9mf2sg8cd' from the grower to the importer. POST a 'transferCoffee' transaction with the following json:

{
  "$class": "org.ibm.coffee.transferCoffee",
  "newOwner": "resource:org.ibm.coffee.Importer#importerA",
  "batchId": "9mf2sg8cd",
  "ownerType": "importer"
}

Cool. Now the coffee's owner is changed to importerA. 

Let's query for all of the transactions associated with batch '9mf2sg8cd'.

Let's do a GET query for 'query/getBatchHistory' and for the batchId fill in '9mf2sg8cd'.

You should see something like this: 

 {
    "$class": "org.ibm.coffee.transferCoffee",
    "newOwner": "resource:org.ibm.coffee.Regulator#regulatorA",
    "batchId": "9mf2sg8cd",
    "ownerType": "regulator",
    "transactionId": "69b0a3501e6851c79a823439bf7d0843b8d30ad11b9ad178bf61444b92199638",
    "timestamp": "2018-05-23T23:23:42.284Z"
  }
  
  Cool. Now you can imagine that when we create a regulator and a retailer, and we transfer the coffee to them, the last query would have 3 transactions instead, showing that the coffee has passed through not only the importer, but the regulator and reatailer as well.
  
  *********************** WIP **********************************
