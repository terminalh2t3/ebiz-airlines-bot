"use strict";
const fbMessage = require('../utils/fbSend');

module.exports = (bot, sessions) => {
    let actions = {
        send({sessionId}, {text}) {
            // Our bot has something to say!
            // Let's retrieve the Facebook user whose session belongs to
            const recipientId = sessions[sessionId].fbid;
            if (recipientId) {
                // Yay, we found our recipient!
                // Let's forward our bot response to her.
                // We return a promise to let our bot know when we're done sending
                return fbMessage(recipientId, text)
                    .then(() => null)
                    .catch((err) => {
                        console.error(
                            'Oops! An error occurred while forwarding the response to',
                            recipientId,
                            ':',
                            err.stack || err
                        );
                    });
            } else {
                console.error('Oops! Couldn\'t find user for session:', sessionId);
                // Giving the wheel back to our bot
                return Promise.resolve()
            }
        }
    };

    //Load more actions
    const normalizedPath = require('path').join(__dirname, '../../../chatbot/actions');

    require("fs").readdirSync(normalizedPath).forEach(function(file) {
        const loadedActions = require("../../../chatbot/actions/" + file)(bot);
        actions = Object.assign(loadedActions, actions);
    });
    return actions;
};