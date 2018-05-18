'use strict';

const builder = require('botbuilder');
const restify = require('restify');
const utils = require('./utils.js');
const customVisionService = require('./customVisionService.js');

// Create chat connector for communicating with the Bot Framework Service
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`${server.name} listening to ${server.url}`);
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

const bot = new builder.UniversalBot(connector);

// default dialog
// bot.dialog('/', function(session) {
//     if(utils.hasImageAttachment(session)){
//         session.send('You\'ve sent me an image!'); // temporary code to see if we've actually received the image or not
//         var stream = utils.getImageStreamFromMessage(session.message); // this will be used later on for sending the image stream to the Prediction API of Custom Vision
        
//     } else {
//         session.send('I did not receive any image');
//     }
// });
bot.dialog('/', function(session) {
    if(utils.hasImageAttachment(session)){
        var stream = utils.getImageStreamFromMessage(session.message); 
        customVisionService.predict(stream)
            .then(function (response) {
                // Convert buffer into string then parse the JSON string to object
                //var jsonObj = JSON.parse(response.toString('utf8'));
                var jsonObj = JSON.parse(response);
                var topPrediction = jsonObj["predictions"][0];
                // make sure we only get confidence level with 0.80 and above. But you can adjust this depending on your need
                console.log("Prediction: " + topPrediction.probability);
                if (topPrediction.probability >= 0.80) {
                    session.send(`Hey, I think this image is a ${topPrediction.tagName}!`);
                } else if (topPrediction.probability >= 0.50){
                    session.send(`Meybe this image is a ${topPrediction.tagName}!`);
                }else {
                    session.send('Sorry! I don\'t know what that is :(');
                }
            }).catch(function (error) {
                console.log(error);
                session.send('Oops, there\'s something wrong with processing the image. Please try again.');
            });

    } else {
        session.send('I did not receive any image');
    }
});