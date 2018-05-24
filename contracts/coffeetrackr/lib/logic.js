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