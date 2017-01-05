"use strict";
const fbMessage = require('../utils/fbSend');

module.exports = (bot) => {
    let actions = {
        send({sessionId}, {text}) {
            const recipientId = bot.sessions[sessionId].fbid;
            if (recipientId) {
                bot.sendTextMessage(recipientId, text, null, {typing: true});
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