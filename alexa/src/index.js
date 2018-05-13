const Alexa = require('alexa-sdk');

const Comm       = require('./helpers/communicationHelper.js');
const perfHelper = require('./helpers/performanceHelper.js');

const states = {
    START       : "_START_MODE",
    MESSAGESTATE: "_MESSAGE_STATE"
};

const messages = {
    initial       : 'Ok! What do you want to do?',
    squatsProposal: 'Hmm, I have a workout just for you. Just tell me when you\'re ready.',
    startSquats   : 'Lets start!' +
    '<break time="1000ms"/>' +
    '<prosody volume="x-loud" rate="fast">3!</prosody>' +
    '<break time="2250ms"/>' +
    '<prosody volume="x-loud" rate="fast">2!</prosody>' +
    '<break time="2250ms"/>' +
    '<prosody volume="x-loud" rate="fast">1!</prosody>' +
    '<break time="2250ms"/>' +
    '<prosody volume="x-loud" rate="fast">3!</prosody>' +
    '<break time="2250ms"/>' +
    '<prosody volume="x-loud" rate="fast">1!</prosody>' +
    '<break time="2250ms"/>' +
    '<prosody volume="x-loud" rate="fast">1!</prosody>' +
    '<break time="2250ms"/>' +
    '<prosody volume="x-loud" rate="fast">3!</prosody>' +
    '<emphasis level="reduced">Keep going!</emphasis>' +
    '<break time="500ms"/>' +
    '<prosody volume="x-loud" rate="fast">1!</prosody>' +
    '<break time="1000ms"/>' +
    '<prosody volume="x-loud" rate="fast">3!</prosody>' +
    '<break time="300ms"/>' +
    '<prosody volume="x-loud" rate="fast">1!</prosody>' +
    '<break time="300ms"/>' +
    '<prosody volume="x-loud" rate="fast">3!</prosody>' +
    '<break time="300ms"/>' +
    '<prosody volume="x-loud" rate="fast">2!</prosody>' +
    '<break time="300ms"/>' +
    '<prosody volume="x-loud" rate="fast">1!</prosody>' +
    '<break time="300ms"/>',
    greeting      : 'Hello everyone and welcome to Hack TM 2018!',
    fallowup      : '. Would you like to hear more trivia?',
    help          : 'I can assist you in your everyday sport activities, give you exercises instructions and statistics about your progress. Try saying you want some big legs.',
    whatsNext     : 'What\'s next?',
    goodbye       : 'Goodbye everyone! See you next year!',
    unhandled     : 'I didn\'t get that. You can ask for help anytime'
};

let lastAlexaPhrase = 'initial';

// Called when the session starts.
exports.handler = function(event, context, callback) {
    let alexa   = Alexa.handler(event, context);
    alexa.appId = process.env.ALEXA_APP_ID;
    // alexa.applicationId=process.env.ALEXA_APP_ID;

    // Fix for hardcoded context from simulator
    if (event.context && event.context.System.application.applicationId == 'applicationId') {
        event.context.System.application.applicationId = event.session.application.applicationId;
    }

    alexa.registerHandlers(newSessionHandler, responseHandler);
    alexa.execute();
};

// Set state to start up and welcome the user
const newSessionHandler = {
    'NewSession': function() {
        console.log('\n ===== THIS stringified ===== \n' + JSON.stringify(this));
        this.handler.state = states.START;
        this.emit(':ask', messages.initial);

        // TODO: Remove this
        // Comm.sendStartTrainingSignal(() => {
        //     this.emit(':ask', messages.startSquats);
        // });
    }
};

const responseHandler = Alexa.CreateStateHandler(states.START, {
    'NewSession'          : function() {
        this.handler.state = '';
        this.emitWithState('NewSession');
    },
    'IWantLegsIntent'     : function() {
        lastAlexaPhrase = 'squatsProposal';
        this.emit(':ask', messages.squatsProposal);
    },
    'LetsStartIntent'     : function() {
        Comm.sendStartTrainingSignal(() => {
            lastAlexaPhrase = 'whatsNext';
            this.emit(':ask', messages.startSquats + messages.whatsNext);
        });
    },
    'HowDidIDoIntent'     : function() {
        Comm.getStatistics((data) => {
            let message       = 'Your performance was ';
            const performance = perfHelper.getPerformance(data.squats);

            message += `${ performance.grade }. You did ${ performance.nrOfGoodSquats } out of 13 correctly. ${ messages.whatsNext }`;

            lastAlexaPhrase = 'whatsNext';
            this.emit(':ask', message);
        });
    },
    'AMAZON.YesIntent'    : function() {
        Comm.sendStartTrainingSignal(() => {
            lastAlexaPhrase = 'whatsNext';
            this.emit(':ask', messages.startSquats + messages.whatsNext);
        });
    },
    'AMAZON.NoIntent'     : function() {
        lastAlexaPhrase = 'goodbye';
        this.emit(':tell', messages.goodbye);
    },
    'SayHelloIntent'      : function() {
        lastAlexaPhrase = 'greeting';
        this.emit(':ask', messages.greeting);
    },
    'TellTriviaIntent'    : function() {
        Comm.getTrivia((message) => {
            this.emit(':ask', message + messages.fallowup);
        });
    },
    'AMAZON.StopIntent'   : function() {
        lastAlexaPhrase = 'goodbye';
        this.emit(':tell', messages.goodbye);
    },
    'RepeatQuestionIntent': function() {
        this.emit(':ask', 'Sure. ' + messages[lastAlexaPhrase]);
    },
    'AMAZON.HelpIntent'   : function() {
        lastAlexaPhrase = 'help';
        this.emit(':ask', messages.help);
    },
    'Unhandled'           : function() {
        lastAlexaPhrase = 'help';
        this.emit(':ask', messages.unhandled);
    }
});
