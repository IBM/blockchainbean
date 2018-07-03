/**
 * New script file
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
/*
cupId: 
the id of the cup, e.g., CJB02185 
“C" stands for “Cold Drink” 
“J” stands for “Josh” one of the baristas 
“B” for the Banko Gotiti coop beans we will be using 
"02185” is the cup ID (note all the cup ids will be UIDs 
Full data set is TBD but this is what we currently understand to be the different things: 
Data Value => Data Code 
Banko Gotiti => B 
Nicole => N 
Josh => J 
Cold => C 
Expresso => E 
Nitro => I 
Input structure is: <DrinkType><Barista><BeanType><CupID> 
timestamp: (optional)
the time at which the cup was poured. Should default to “now” if this field is omitted 
format YYYYMMDD-HH:MM (time should be in 24h format) 
*/

/**
 * Sample transaction processor function.
 * @param {org.ibm.coffee.pourCup} tx The send message instance.
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
 * Sample transaction processor function.
 * @param {org.ibm.coffee.transferCoffee} tx The send message instance.
 * @transaction
 */
async function transferCoffee(coffeeBatch) {

  if (coffeeBatch.batchId.length <= 0) {
    throw new Error('Please enter the batchId');
  }

  if (coffeeBatch.newOwner.length <= 0) {
    throw new Error('Please enter the new owner');
  }

  const assetRegistry = await getAssetRegistry('org.ibm.coffee.Coffee');

  const exists = await assetRegistry.exists(coffeeBatch.batchId);

  if (exists) {
    const coffee = await assetRegistry.get(coffeeBatch.batchId);

    var event = getFactory().newEvent('org.ibm.coffee', 'transferComplete');
    event.batchId = coffeeBatch.batchId;
    var dateStr = new Date();
    dateStr = dateStr.toString();
    event.timeStamp = dateStr;
    event.oldOwner = coffee.owner;
    event.newOwner = coffeeBatch.newOwner;
    emit(event);
    coffeeBatch.oldOwner = coffee.owner;
    coffee.owner = coffeeBatch.newOwner;
    if(!coffeeBatch.newOwner.batches) {
      coffeeBatch.newOwner.batches = [];
    }
    coffeeBatch.newOwner.batches.push(coffee);

    if (coffeeBatch.newOwnerType.toLowerCase() == 'importer') {

      const participantRegistry = await getParticipantRegistry('org.ibm.coffee.Importer');
      await participantRegistry.update(coffeeBatch.newOwner);
      coffee.batchState = "IMPORTED";

    } else if (coffeeBatch.newOwnerType.toLowerCase() == 'regulator') {
      const participantRegistry = await getParticipantRegistry('org.ibm.coffee.Regulator');
      await participantRegistry.update(coffeeBatch.newOwner);
      coffee.batchState = "REGULATION_TEST_PASSED";
    } else {
      const participantRegistry = await getParticipantRegistry('org.ibm.coffee.Retailer');
      await participantRegistry.update(coffeeBatch.newOwner);
      coffee.batchState = "READY_FOR_SALE";
    }

    await assetRegistry.update(coffee);


  } else {
    throw new Error('the batch you specified does not exist!');
  }
}


/**
 * Sample transaction processor function.
 * @param {org.ibm.coffee.addCoffee} tx The send message instance.
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

  if(!newCoffee.grower.batches) {
    newCoffee.grower.batches = [];
  }

  newCoffee.grower.batches.push(coffee);
  const assetRegistry = await getAssetRegistry('org.ibm.coffee.Coffee');
  await assetRegistry.add(coffee);
  await participantRegistry.update(newCoffee.grower);
}


/**
 * Regulate
 * @param {org.ibm.coffee.regulateCoffee} tx The send message instance.
 * @transaction
 */
async function regulateCoffeeICO(coffeeBatch) {

  if (coffeeBatch.batchId.length <= 0) {
    throw new Error('Please enter the batchId');
  }

  const assetRegistry = await getAssetRegistry('org.ibm.coffee.Coffee');

  const exists = await assetRegistry.exists(coffeeBatch.batchId);

  if (exists) {
    const coffee = await assetRegistry.get(coffeeBatch.batchId);

    // Create an emit a regulation event
    var event = getFactory().newEvent('org.ibm.coffee', 'regulationComplete');
    event.batchId = coffeeBatch.batchId;
    var dateStr = new Date();
    dateStr = dateStr.toString();
    event.timeStamp = dateStr;
    event.owner = coffee.owner;
    event.regulator = coffeeBatch.regulator;
    emit(event);

    // Annotate coffee asset with certified data
    coffee.ICO_CertificateOfOriginId = coffeeBatch.ICO_CertificateOfOriginId;
    coffee.ICO_ProducingCountry = coffeeBatch.ICO_ProducingCountry;
    coffee.ICO_CountryOfDestination = coffeeBatch.ICO_CountryOfDestination;
    coffee.ICO_DateOfExport = coffeeBatch.ICO_DateOfExport;
    coffee.ICO_Organic = coffeeBatch.regulateCoffeeICO_Organic;
    coffee.ICO_IdentificationMark = coffeeBatch.ICO_IdentificationMark;

    // publish update
    await assetRegistry.update(coffee);

  } else {
    throw new Error('the batch you specified does not exist!');
  }
}


/**
 * Certify the coffee is organic
 * @param {org.ibm.coffee.certifyOrganic} tx The send message instance.
 * @transaction
 */
async function certifyOrganic(coffeeBatch) {

  if (coffeeBatch.batchId.length <= 0) {
    throw new Error('Please enter the batchId');
  }

  const assetRegistry = await getAssetRegistry('org.ibm.coffee.Coffee');

  const exists = await assetRegistry.exists(coffeeBatch.batchId);

  if (exists) {
    const coffee = await assetRegistry.get(coffeeBatch.batchId);

    // Create and emit a regulation event
    var event = getFactory().newEvent('org.ibm.coffee', 'regulationComplete');
    event.batchId = coffeeBatch.batchId;
    var dateStr = new Date();
    dateStr = dateStr.toString();
    event.timeStamp = dateStr;
    event.owner = coffee.owner;
    event.regulator = coffeeBatch.regulator;
    emit(event);

    // Annotate coffee asset with certified data
    coffee.OFC_OrganicFarmingCertificateId = coffeeBatch.OFC_OrganicFarmingCertificateId;
    coffee.OFC_InvoiceNo = coffeeBatch.OFC_InvoiceNo;
    coffee.OFC_InvoiceDate  = coffeeBatch.OFC_InvoiceDate
    coffee.OFC_ContainerNo  =  coffeeBatch.OFC_ContainerNo;
    coffee.OFC_ContractNo  =  coffeeBatch.OFC_ContractNo;
    coffee.OFC_ICO_No  = coffeeBatch.OFC_ICO_No;

    // publish update
    await assetRegistry.update(coffee);

  } else {
    throw new Error('the batch you specified does not exist!');
  }
}


/**
 * Ship the coffee
 * @param {org.ibm.coffee.shipCoffee} tx The send message instance.
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
    event.grower = coffeeBatch.grower;
    event.shipper = coffeeBatch.shipper;
    event.trader = coffeeBatch.trader;
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

    // publish update
    await assetRegistry.update(coffee);

  } else {
    throw new Error('the batch you specified does not exist!');
  }
}

