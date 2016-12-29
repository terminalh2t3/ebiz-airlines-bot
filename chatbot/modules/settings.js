'use strict';
module.exports = (bot) => {
    bot.setGreetingText('Hi {{user_first_name}}, welcome to Ebiz Airlines.');
    bot.setGetStartedButton((payload, chat) => {
        chat.say('Welcome to Ebiz Airlines. If you don\'t know how to getting started, type \'help\' for support');
    });
    bot.setPersistentMenu([
        {
            type: 'postback',
            title: 'Booking flight',
            payload: 'PERSISTENT_MENU_BOOKING'
        },
        {
            type: 'postback',
            title: 'About Ebiz Bot',
            payload: 'PERSISTENT_ABOUT_CHATBOT'
        },
        {
            type: 'web_url',
            title: 'Website',
            url: 'http://www.ebiz.solutions'
        }
    ]);

    bot.on('postback:PERSISTENT_MENU_BOOKING', function(payload, chat){
        chat.runWit('Booking flight');
    });

    bot.on('postback:PERSISTEN_ABOUT_CHATBOT', function(payload, chat){
        chat.sendTextMessage('Ebiz Airlines is not REAL but Ebiz Solutions is REAL. ' +
            'We are a company from Vietnam who created this bot for airlines vertical.')
    });
};
