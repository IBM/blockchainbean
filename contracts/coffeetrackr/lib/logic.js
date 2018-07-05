/**
 * Script file for executing logic to track coffee on the supply chain.
 *//*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Transaction used when pouring a cup of coffee at the event. Will
 * record who poured it, what time, what type of coffee, etc.
 * Users then can use this cupId later to get more details from the
 * blockchain about their beverage
 * @param {org.ibm.coffee.pourCup} newCoffee - the input parameters from user
 * @transaction
 */



async function pourCup(newCoffee) {
  
  if (newCoffee.cupId.length <= 0) {
    throw new Error('Please enter the batchId');
  }	
  
  var str = newCoffee.cupId;
  var NS = 'org.ibm.coffee';
  var cup = getFactory().newResource(NS, 'cupCoffee', newCoffee.cupId);
  
  // first character of input is the drink type
  character = str.charAt(0)
  if (character.toLowerCase() === 'c') {
  	cup.drinkType = 'Cold Drink';
  } else if (character.toLowerCase() === 'e') {
  	cup.drinkType = 'Espresso';
  } else {
    cup.drinkType = 'Nitro';
  }
  
  //second character is barista
  character = str.charAt(1)
  if (character.toLowerCase() === 'j') {
  	cup.barista = 'Josh';
  } else {
    cup.barista = 'Nicole';
  }
  
  //third character is coop
  
  character = str.charAt(2)
  if (character.toLowerCase() === 'b') {
  	cup.beanType = 'Banko Gotiti';
  }
  
  
  if (newCoffee.timeStamp == undefined) {
    var dateStr = new Date();
  	dateStr = dateStr.toString();
  	cup.lastPour = dateStr;
  } else {
  	cup.lastPour = newCoffee.timeStamp;
  }
  
  var count = 1 
  cup.count = count;

  const assetRegistry = await getAssetRegistry('org.ibm.coffee.cupCoffee');
  await assetRegistry.add(cup);

  var event = getFactory().newEvent('org.ibm.coffee', 'cupData');

  event.cupId = cup.cupId;
  event.drinkType = cup.drinkType;
  event.barista = cup.barista;
  event.beanType = cup.beanType;
  event.count = cup.count;
  //get timestamp

  event.lastPour = dateStr;

  //fire event
  emit(event);
  
}

/**
 * When a grower adds a batch of coffee to the blockchain.
 * This creates the coffee asset automatically on the blockchain.
 * @param {org.ibm.coffee.addCoffee} newCoffee - the new coffee that we create
 * @transaction
 */
async function addCoffee(newCoffee) {

  const participantRegistry = await getParticipantRegistry('org.ibm.coffee.Grower');
  var NS = 'org.ibm.coffee';
  var coffee = getFactory().newResource(NS, 'Coffee', Math.random().toString(36).substring(3));
  coffee.size = newCoffee.size;
  coffee.roast = newCoffee.roast;
  coffee.owner = newCoffee.grower;
  coffee.batchState = newCoffee.batchState;

  const assetRegistry = await getAssetRegistry('org.ibm.coffee.Coffee');
  await assetRegistry.add(coffee);
  await participantRegistry.update(newCoffee.grower);
}


/**
 * Regulate the coffee - send coffee to ICO for regulation
 * @param {org.ibm.coffee.regulateCoffee} coffeeBatch - the batch we are regulating
 * @transaction
 */
async function regulateCoffeeICO(coffeeBatch) {

  if (coffeeBatch.batchId.length <= 0) {
    throw new Error('Please enter the batchId');
  }
  

  const assetRegistry = await getAssetRegistry('org.ibm.coffee.Coffee');

  const exists = await assetRegistry.exists(coffeeBatch.batchId);
  
  const participantRegistry = await getParticipantRegistry('org.ibm.coffee.Regulator');


  if (exists) {
    const coffee = await assetRegistry.get(coffeeBatch.batchId);

    // Create an emit a regulation event
    var event = getFactory().newEvent('org.ibm.coffee', 'regulationComplete');
    event.batchId = coffeeBatch.batchId;
    var dateStr = new Date();
    dateStr = dateStr.toString();
    event.timeStamp = dateStr;
    event.owner = coffeeBatch.regulator;
    event.regulator = coffeeBatch.regulator;
    emit(event);

    // Annotate coffee asset with certified data
    coffee.ICO_CertificateOfOriginId = coffeeBatch.ICO_CertificateOfOriginId;
    coffee.ICO_ProducingCountry = coffeeBatch.ICO_ProducingCountry;
    coffee.ICO_CountryOfDestination = coffeeBatch.ICO_CountryOfDestination;
    coffee.ICO_DateOfExport = coffeeBatch.ICO_DateOfExport;
    coffee.ICO_Organic = coffeeBatch.regulateCoffeeICO_Organic;
    coffee.ICO_IdentificationMark = coffeeBatch.ICO_IdentificationMark;
    
    //update ownership
    coffee.owner = coffeeBatch.regulator;
    coffee.batchState = 'REGULATION_TEST_PASSED'

    // publish update
    await assetRegistry.update(coffee);
    await participantRegistry.update(coffeeBatch.regulator);


  } else {
    throw new Error('the batch you specified does not exist!');
  }
}


/**
 * Certify the coffee is organic
 * @param {org.ibm.coffee.certifyOrganic} coffeeBatch - the batch we are certifying
 * @transaction
 */
async function certifyOrganic(coffeeBatch) {

  if (coffeeBatch.batchId.length <= 0) {
    throw new Error('Please enter the batchId');
  }

  const assetRegistry = await getAssetRegistry('org.ibm.coffee.Coffee');
    
  const coffeeExists = await assetRegistry.exists(coffeeBatch.batchId);
  
  const participantRegistry = await getParticipantRegistry('org.ibm.coffee.Regulator');

  
  if (coffeeExists ) {
    const coffee = await assetRegistry.get(coffeeBatch.batchId);

    // Create and emit a regulation event
    var event = getFactory().newEvent('org.ibm.coffee', 'organicCertification');
    event.batchId = coffeeBatch.batchId;
    var dateStr = new Date();
    dateStr = dateStr.toString();
    event.timeStamp = dateStr;
    event.owner = coffeeBatch.regulator;
    event.regulator = coffeeBatch.regulator;
    emit(event);

    // Annotate coffee asset with certified data
    coffee.OFC_OrganicFarmingCertificateId = coffeeBatch.OFC_OrganicFarmingCertificateId;
    coffee.OFC_InvoiceNo = coffeeBatch.OFC_InvoiceNo;
    coffee.OFC_InvoiceDate  = coffeeBatch.OFC_InvoiceDate
    coffee.OFC_ContainerNo  =  coffeeBatch.OFC_ContainerNo;
    coffee.OFC_ContractNo  =  coffeeBatch.OFC_ContractNo;
    coffee.OFC_ICO_No  = coffeeBatch.OFC_ICO_No;
    coffee.batchState = 'ORGANIC_CERTIFICATION_APPROVED'
    
    //update ownership
    coffee.owner = coffeeBatch.regulator;

    // publish update
    await participantRegistry.update(coffeeBatch.regulator);
    await assetRegistry.update(coffee);


  } else {
    throw new Error('the batch you specified does not exist!');
  }
}


/**
 * Ship the coffee
 * @param {org.ibm.coffee.shipCoffee} coffeeBatch - the batch we are shipping
 * @transaction
 */
async function shipCoffee(coffeeBatch) {
  // this one actually uses two documents, the packing list and BoL

  if (coffeeBatch.batchId.length <= 0) {
    throw new Error('Please enter the batchId');
  }
  
  const assetRegistry = await getAssetRegistry('org.ibm.coffee.Coffee');
  const exists = await assetRegistry.exists(coffeeBatch.batchId);

  if (exists) {
    const coffee = await assetRegistry.get(coffeeBatch.batchId);

    // Create and emit a regulation event
    var event = getFactory().newEvent('org.ibm.coffee', 'shippingComplete');
    event.batchId = coffeeBatch.batchId;
    var dateStr = new Date();
    dateStr = dateStr.toString();
    event.timeStamp = dateStr;
    event.shipper = coffeeBatch.shipper;
    event.owner = coffeeBatch.trader;
    emit(event);

    /**
     * # Packing List
     */
    coffee.PL_PackingListId  = coffeeBatch.PL_PackingListId;
    coffee.PL_ICO_no  = coffeeBatch.PL_ICO_no;
    coffee.PL_FDA_NO  = coffeeBatch.PL_FDA_NO;
    coffee.PL_Bill_of_Lading_No  = coffeeBatch.PL_Bill_of_Lading_No;
    coffee.PL_Container_No  = coffeeBatch.PL_Container_No;
    coffee.PL_Seal_no  = coffeeBatch.PL_Seal_no;


    /**
     * # Bill Of Lading
     */
    coffee.BOL_BillOfLadingId  = coffeeBatch.BOL_BillOfLadingId;
    coffee.BOL_Booking_no  = coffeeBatch.BOL_Booking_no;
    coffee.BOL_vessel  = coffeeBatch.BOL_vessel;
    coffee.BOL_voyage_no = coffeeBatch.BOL_voyage_no;
    coffee.BOL_contract = coffeeBatch.BOL_contract;
    coffee.BOL_Cert_no = coffeeBatch.BOL_Cert_no;
    coffee.BOL_ICO_no  = coffeeBatch.BOL_ICO_no;
    
    coffee.batchState = 'IMPORTED';
    
    
    var participantRegistry = await getParticipantRegistry('org.ibm.coffee.Shipper');
    await participantRegistry.update(coffeeBatch.shipper);
    //update ownership
    coffee.owner = coffeeBatch.trader;
    participantRegistry = await getParticipantRegistry('org.ibm.coffee.Trader');
    await participantRegistry.update(coffeeBatch.trader);

    // publish update
    await assetRegistry.update(coffee);

  } else {
    throw new Error('the batch you specified does not exist!');
  }
}

/**
 * Purchase coffee from the importer / warehouser. This is Royal coffee for our use case.
 * @param {org.ibm.coffee.purchaseCoffee} coffeeBatch - the batch we are purchasing
 * @transaction
 */
async function purchaseCoffee(coffeeBatch) {
  // this one actually uses two documents, the packing list and BoL
  
  if (coffeeBatch.batchId.length <= 0) {
    throw new Error('Please enter the batchId');
  }

  const assetRegistry = await getAssetRegistry('org.ibm.coffee.Coffee');

  const exists = await assetRegistry.exists(coffeeBatch.batchId);

  if (exists) {
    const coffee = await assetRegistry.get(coffeeBatch.batchId);

    coffee.PC_PurchaseConfirmationId = coffeeBatch.PC_PurchaseConfirmationId;
    coffee.PC_Order_id = coffeeBatch.PC_Order_id;
    coffee.PC_ICO_No = coffeeBatch.PC_ICO_No;
    coffee.PC_Invoice_No = coffeeBatch.PC_Invoice_No;
    coffee.PC_RNY_FLO_ID = coffeeBatch.PC_RNY_FLO_ID;
    coffee.PC_Brook_FLO_ID = coffeeBatch.PC_Brook_FLO_ID;
    


    // Create and emit a regulation event
    var event = getFactory().newEvent('org.ibm.coffee', 'purchaseComplete');
    event.batchId = coffeeBatch.batchId;
    var dateStr = new Date();
    dateStr = dateStr.toString();
    event.timeStamp = dateStr;
    event.trader = coffeeBatch.trader;
    event.retailer = coffeeBatch.retailer;
    emit(event);
    
    var participantRegistry = await getParticipantRegistry('org.ibm.coffee.Trader');
    await participantRegistry.update(coffeeBatch.trader);
    //update ownership
    coffee.owner = coffeeBatch.retailer;
    participantRegistry = await getParticipantRegistry('org.ibm.coffee.Retailer');
    await participantRegistry.update(coffeeBatch.retailer);
    
    coffee.batchState = 'READY_FOR_SALE';

    // publish update
    await assetRegistry.update(coffee);

  } else {
    throw new Error('the batch you specified does not exist!');
  }
}


