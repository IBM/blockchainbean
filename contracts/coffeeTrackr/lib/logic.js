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
      cup.drinkType = 'Iced';
    } else if (character.toLowerCase() === 'e') {
      cup.drinkType = 'Hot';
    } else {
      cup.drinkType = 'Nitro';
    }

    //second character is barista
    character = str.charAt(1)
    if (character.toLowerCase() === 'j') {
      cup.barista = 'Josh';
    } else {
      cup.barista = 'Siv';
    }

    //third character is coop

    character = str.charAt(2)
    if (character.toLowerCase() === 'b') {
      cup.beanType = 'Ethiopian Natural Yirgacheffe';
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
   * Submit packing list. Submit shipping details.
   * @param {org.ibm.coffee.submitPackingList} coffeeBatch - the batch we are purchasing
   * @transaction
   */
  async function submitPackingList(coffeeBatch) {
    // this one actually uses two documents, the packing list and BoL

    if (coffeeBatch.batchId.length <= 0) {
      throw new Error('Please enter the batchId');
    }

    const assetRegistry = await getAssetRegistry('org.ibm.coffee.Coffee');

    const exists = await assetRegistry.exists(coffeeBatch.batchId);

    if (exists) {
      const coffee = await assetRegistry.get(coffeeBatch.batchId);

    coffee.owner = coffeeBatch.trader;
      coffee.PL_Invoice_no = coffeeBatch.PL_Invoice_no;
      coffee.PL_IssueDate = coffeeBatch.PL_IssueDate;
      coffee.PL_ICO_no = coffeeBatch.PL_ICO_no;
      coffee.PL_ICO_Lot = coffeeBatch.PL_ICO_Lot;
      coffee.PL_FDA_NO = coffeeBatch.PL_FDA_NO;
      coffee.PL_Bill_of_Lading_No = coffeeBatch.PL_Bill_of_Lading_No;
      coffee.PL_LoadedVessel = coffeeBatch.PL_LoadedVessel;
      coffee.PL_VesselVoyage_No = coffeeBatch.PL_VesselVoyage_No;
      coffee.PL_Container_No = coffeeBatch.PL_Container_No;
      coffee.PL_Seal_no = coffeeBatch.PL_Seal_no;
      coffee.batchState = 'IMPORTED';
      coffee.PL_timestamp = coffeeBatch.PL_timestamp;

      // Create and emit a regulation event
      var event = getFactory().newEvent('org.ibm.coffee', 'getPackingList');
      event.batchId = coffeeBatch.batchId;
      event.grower = coffeeBatch.grower;
      event.consignee = coffeeBatch.trader;
      event.PL_Invoice_no = coffeeBatch.PL_Invoice_no;
      event.PL_IssueDate = coffeeBatch.PL_IssueDate;
      event.PL_ICO_no = coffeeBatch.PL_ICO_no;
      event.PL_ICO_Lot = coffeeBatch.PL_ICO_Lot;
      event.PL_FDA_NO = coffeeBatch.PL_FDA_NO;
      event.PL_Bill_of_Lading_No = coffeeBatch.PL_Bill_of_Lading_No;
      event.PL_LoadedVessel = coffeeBatch.PL_LoadedVessel;
      event.PL_VesselVoyage_No = coffeeBatch.PL_VesselVoyage_No;
      event.PL_Container_No = coffeeBatch.PL_VesselVoyage_No;
      event.PL_Seal_no = coffeeBatch.PL_Seal_no;
      event.PL_timestamp = coffeeBatch.PL_timestamp;


      emit(event);

      var participantRegistry = await getParticipantRegistry('org.ibm.coffee.Trader');
      await participantRegistry.update(coffeeBatch.trader);
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
   * Get data about fair trade. Details about investments.
   * @param {org.ibm.coffee.submitFairTradeData} coffeeBatch - the batch we are purchasing
   * @transaction
   */
  async function submitFairTradeData(coffeeBatch) {
    // this one actually uses two documents, the packing list and BoL

    if (coffeeBatch.batchId.length <= 0) {
      throw new Error('Please enter the batchId');
    }

    const assetRegistry = await getAssetRegistry('org.ibm.coffee.Coffee');

    const exists = await assetRegistry.exists(coffeeBatch.batchId);

    if (exists) {
      const coffee = await assetRegistry.get(coffeeBatch.batchId);

      coffee.reportName = coffeeBatch.reportName;
      coffee.organizationDescription = coffeeBatch.organizationDescription;
      coffee.reportYear = coffeeBatch.reportYear;
      coffee.fairtradePremiumInvested = coffeeBatch.fairtradePremiumInvested;
      coffee.investmentTitle1 = coffeeBatch.investmentTitle1;
      coffee.investmentTitle2 = coffeeBatch.investmentTitle2;
      coffee.investmentTitle3 = coffeeBatch.investmentTitle3;
      coffee.investmentAmount1 = coffeeBatch.investmentAmount1;
      coffee.investmentAmount2 = coffeeBatch.investmentAmount2;
      coffee.investmentAmount3 = coffeeBatch.investmentAmount3;

      // Create and emit a regulation event
      var event = getFactory().newEvent('org.ibm.coffee', 'getFairTradeData');
      event.batchId = coffeeBatch.batchId;
      event.reportName = coffeeBatch.reportName;
      event.organizationDescription = coffeeBatch.organizationDescription;
      event.reportYear = coffeeBatch.reportYear;
      event.fairtradePremiumInvested = coffeeBatch.fairtradePremiumInvested;
      event.investmentTitle1 = coffeeBatch.investmentTitle1;
      event.investmentTitle2 = coffeeBatch.investmentTitle2;
      event.investmentTitle3 = coffeeBatch.investmentTitle3;
      event.investmentAmount1 = coffeeBatch.investmentAmount1;
      event.investmentAmount2 = coffeeBatch.investmentAmount2;
      event.investmentAmount3 = coffeeBatch.investmentAmount3;
      emit(event);

      // publish update
      await assetRegistry.update(coffee);

    } else {
      throw new Error('the batch you specified does not exist!');
    }
  }

  /**
   * Get data about fair trade. Details about investments.
   * @param {org.ibm.coffee.submitInboundWeightTally} coffeeBatch - the batch we are purchasing
   * @transaction
   */
  async function submitInboundWeightTally(coffeeBatch) {
    // this one actually uses two documents, the packing list and BoL

    if (coffeeBatch.batchId.length <= 0) {
      throw new Error('Please enter the batchId');
    }

    const assetRegistry = await getAssetRegistry('org.ibm.coffee.Coffee');

    const exists = await assetRegistry.exists(coffeeBatch.batchId);

    if (exists) {
      const coffee = await assetRegistry.get(coffeeBatch.batchId);

      coffee.dateStripped = coffeeBatch.dateStripped;
      coffee.marks = coffeeBatch.marks;
      coffee.bagsExpected = coffeeBatch.bagsExpected;
      coffee.condition = coffeeBatch.condition;
      coffee.insectActivity = coffeeBatch.insectActivity;

      // Create and emit a regulation event
      var event = getFactory().newEvent('org.ibm.coffee', 'getInboundWeightTally');
      event.batchId = coffeeBatch.batchId;
      var dateStr = new Date();
      dateStr = dateStr.toString();
      event.timeStamp = dateStr;

      event.dateStripped = coffeeBatch.dateStripped;
      event.marks = coffeeBatch.marks;
      event.bagsExpected = coffeeBatch.bagsExpected;
      event.condition = coffeeBatch.condition;
      event.insectActivity = coffeeBatch.insectActivity;
      event.asset = coffee;

      emit(event);

      // publish update
      await assetRegistry.update(coffee);

    } else {
      throw new Error('the batch you specified does not exist!');
    }
  }

  /**
   * Get data about fair trade. Details about investments.
   * @param {org.ibm.coffee.submitCupping} coffeeBatch - the batch we are purchasing
   * @transaction
   */
  async function submitCupping(coffeeBatch) {
    // this one actually uses two documents, the packing list and BoL

    if (coffeeBatch.batchId.length <= 0) {
      throw new Error('Please enter the batchId');
    }

    const assetRegistry = await getAssetRegistry('org.ibm.coffee.Coffee');

    const exists = await assetRegistry.exists(coffeeBatch.batchId);

    if (exists) {
      const coffee = await assetRegistry.get(coffeeBatch.batchId);

      coffee.date = coffeeBatch.date;
      coffee.cupper = coffeeBatch.cupper;
      coffee.aroma = coffeeBatch.aroma;
      coffee.flavor = coffeeBatch.flavor;
      coffee.afterTaste = coffeeBatch.afterTaste;
      coffee.acidity = coffeeBatch.acidity;
      coffee.body = coffeeBatch.body;
      coffee.finalScore = coffeeBatch.finalScore;

      // Create and emit a regulation event
      var event = getFactory().newEvent('org.ibm.coffee', 'getCupping');
      event.batchId = coffeeBatch.batchId;
      var dateStr = new Date();
      dateStr = dateStr.toString();
      event.timeStamp = dateStr;

      event.date = coffeeBatch.date;
      event.cupper = coffeeBatch.cupper;
      event.aroma = coffeeBatch.aroma;
      event.flavor = coffeeBatch.flavor;
      event.afterTaste = coffeeBatch.afterTaste;
      event.acidity = coffeeBatch.acidity;
      event.body = coffeeBatch.body;
      event.finalScore = coffeeBatch.finalScore;
      event.asset = coffee;

      emit(event);

      // publish update
      await assetRegistry.update(coffee);

    } else {
      throw new Error('the batch you specified does not exist!');
    }
  }
