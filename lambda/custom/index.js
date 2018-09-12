/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'aws-serverless-repository-NYC-Parks-Events-Crawler-EventsTable-TMA80U7K3KX8';


const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome! Let\'s find an event that supports your local parks in NYC.';
    const repromptText = 'You can say a specific burrough, like Manhattan, or just say find me something to do.';

    return handlerInput.responseBuilder
      .speak(speechText + repromptText)
      .reprompt(repromptText)
      .withSimpleCard('New York City Parks', speechText)
      .getResponse();
  },
};

const ReccommendEventIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ReccommendEventIntent';
  },
  async handle(handlerInput) {

    const dialogState = handlerInput.requestEnvelope.request.dialogState;
    
    if (dialogState === `STARTED` || dialogState === `IN PROGRESS`) {
      //Begin dialog management if skill is in the started/in progress state
      handlerInput.responseBuilder.addDelegateDirective(handlerInput.requestEnvelope.request.intent);

    } else {

      //Get slot values for dynamodb lookup
      const boroughId = handlerInput.requestEnvelope.request.intent.slots.borough.resolutions.resolutionsPerAuthority[0].values[0].value.id;
      const categoryId = handlerInput.requestEnvelope.request.intent.slots.category.resolutions.resolutionsPerAuthority[0].values[0].value.id;

      console.log("Borough is = " + boroughId);
      console.log("Category is = " + categoryId);
      
      //Set dynamodb query params
      var params = {
    		"TableName" : TABLE_NAME,
    		FilterExpression: "#borough = :borough and contains(#categories, :categories)",
            ExpressionAttributeNames: {
                "#borough":"borough",
                "#categories":"categories"
                },
            ExpressionAttributeValues : {
                ':borough' : boroughId,
                ':categories' : categoryId
            }
      };
      
      //Make asynchronous scan query to dynamodb
      let response = await dynamo.scan(params).promise();
      
      console.log('++++++RESPONSE++++++')
      console.log(response);

      //Get a random result from the response array
      let itemIndexPosition = randomIntFromInterval(0, response.Count);
      let result = response.Items[itemIndexPosition];

      console.log('++++++RESULT++++++')
      console.log(result);

      //Slot for explicit confirmation of what the end user said
      const categoryValue =  handlerInput.requestEnvelope.request.intent.slots.category.value;

      //Format output speech
      const speechText = categoryValue + '. Got it!' + ' You can check out the ' + result.name + ' event. ' + result.description + 
                        ' It\'s at the ' + result.location +  ' in ' + result.borough + '. The details are in your Alexa App. Have fun!';

      //Generate link for event details
      const eventDetails = 'https://www.nycgovparks.org' + result.id

      handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard(result.name, eventDetails)
        .withShouldEndSession(true);
    }

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    ReccommendEventIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();



//***************************//
//**** HELPER FUNCTIONS *****//
//***************************//

//Gets Random Number based on a min/max value
function randomIntFromInterval(min, max) {
	//subtract 1 from max since arrays start at position 0
	let max = max - 1;

	let randomInt = Math.floor(Math.random() * (max - min + 1) + min);
	return randomInt;
}
