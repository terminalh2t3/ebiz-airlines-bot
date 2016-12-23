'use strict';
module.exports = (bot) => {
    bot.setGreetingText('Hi {{user_first_name}}, welcome to Ebiz Airlines.');
    bot.setGetStartedButton((payload, chat) => {
        chat.say('Welcome to Ebiz Airlines. If you don\'t know how to getting started, type \'help\' for support');
    });
    bot.setPersistentMenu([
        {
            type: 'postback',
            title: 'Help',
            payload: 'PERSISTENT_MENU_HELP'
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
};
