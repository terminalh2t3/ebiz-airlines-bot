'use strict';
module.exports = (bot) => {
    bot.hear(['hello', 'hi', /hey( there)?/i], (payload, chat) => {
        // Send a text message followed by another text message that contains a typing indicator
        chat.say('Hello, how can I help you?', {typing: true}).then(() => {
            chat.say('You could type \'help\' anytime for more support.', { typing: true });
        });
    });
};
