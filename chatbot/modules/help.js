'use strict';
module.exports = (bot) => {
  bot.hear('help', (payload, chat) => {
    const text = payload.message.text;
    const buttons = [
      { type: 'postback', title: 'Find flight', payload: 'PERSISTENT_MENU_BOOKING' },
      { type: 'postback', title: 'Get boarding pass', payload: 'HELP_GET_BOARDING_PASS' }
    ];
    chat.sendButtonTemplate(`Need help? Try one of these options`, buttons, {typing: true});
  });
};
