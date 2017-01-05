'use strict';
module.exports = (bot) => {
    bot.hear(['fuck you', 'fuck', 'shit', 'stupid', /hey( there)?/i], (payload, chat) => {
        // Send a text message followed by another text message that contains a typing indicator
        chat.say('You may be banned if continue talking with me like that', {typing: true});
    });

    bot.hear(['sorry', 'I\'m sorry]'], (payload, chat) => {
        chat.say('OK! Don\'t worry about that.', {typing: true});
    });
};
