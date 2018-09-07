/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome! Let\'s find an event that supports your local parks in NYC.';
    const repromptText = 'You can say a specific burrough, like Manhattan, or just say find me something to do.';

    return handlerInput.responseBuilder
      .speak(speechText + repromptText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const ReccommendEventIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ReccommendEventIntent';
  },
  handle(handlerInput) {

    const dialogState = handlerInput.requestEnvelope.request.dialogState;
    
    if (dialogState === `STARTED` || dialogState === `IN PROGRESS`) {
      handlerInput.responseBuilder.addDelegateDirective(handlerInput.requestEnvelope.request.intent);
    } else {

      const boroughId = handlerInput.requestEnvelope.request.intent.slots.borough.resolutions.resolutionsPerAuthority[0].values[0].id;
      const categoryId = handlerInput.requestEnvelope.request.intent.slots.category.resolutions.resolutionsPerAuthority[0].values[0].id;

      let result = {
        "borough": "Manhattan",
        "categories": [
          "Nature",
          "History",
          "Tours"
        ],
        "day": " 6",
        "description": "Visit some of the park's most famous landmarks, including Conservatory Water, Bethesda Terrace, and The Lake, on this east-to-west tour led by Central Park Conservancy guides.",
        "endDate": "2018-09-06T15:30:00-04:00",
        "id": "/events/2018/09/06/central-park-tour-heart-of-the-park",
        "location": "Samuel F. B. Morse Statue",
        "month": "Sep",
        "name": "Central Park Tour: Heart of the Park",
        "startDate": "2018-09-06T14:00:00-04:00",
        "streetAddress": "null"
      };

      const categoryValue =  handlerInput.requestEnvelope.request.intent.slots.category.value;
      const speechText = categoryValue + '. Got it!' + ' You can check out the ' + result.name + ' event. ' + result.description + 
                        ' It\'s at the ' + result.location +  ' in ' + result.borough + '. The details are in your Alexa App. Have fun!';

      handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard(result.name, result.description)
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
      .withSimpleCard('Hello World', speechText)
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
