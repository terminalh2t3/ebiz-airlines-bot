'use strict';
module.exports = (bot) => {
    bot.hear(['hello', 'hi', /hey( there)?/i], (payload, chat) => {
        // Send a text message followed by another text message that contains a typing indicator
        chat.say('Hello, human friend!').then(() => {
            chat.say('How are you today?', { typing: true });
        });
    });
};
