const Alexa = require('alexa-sdk');

exports.handler = function (event, context, callback) {
  let alexa = Alexa.handler(event, context);
  alexa.appId=process.env.ALEXA_APP_ID;
  // alexa.applicationId=process.env.ALEXA_APP_ID;
  
  // Fix for hardcoded context from simulator
  if(event.context && event.context.System.application.applicationId == 'applicationId'){
    event.context.System.application.applicationId = event.session.application.applicationId;
  }
  
  alexa.registerHandlers(newSessionHandler);
  alexa.execute();
};

const newSessionHandler = {
  'NewSession': function () {
    console.log('\n ===== THIS stringified ===== \n' + JSON.stringify(this));
    this.handler.state = '_START_STATE';
    this.emit(':ask', '');
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', '');
  }
}
