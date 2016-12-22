'use strict';
const BootBot = require('./lib/bot/BootBot');
const config = require('config');

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ?
    process.env.MESSENGER_APP_SECRET :
    config.get('appSecret');

// Arbitrary value used to validate a web hook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
    (process.env.MESSENGER_VALIDATION_TOKEN) :
    config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
    (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
    config.get('pageAccessToken');

// Generate wit token from your wit app
const WIT_TOKEN = (process.env.WIT_TOKEN) ?
    (process.env.WIT_TOKEN) :
    config.get('wit_token');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN)) {
    console.error("Missing config values");
    process.exit(1);
}

const bot = new BootBot({
    accessToken : PAGE_ACCESS_TOKEN,
    verifyToken : VALIDATION_TOKEN,
    appSecret   : APP_SECRET,
    witToken    : WIT_TOKEN,
});

//Load all modules from modules folder
const normalizedPath = require('path').join(__dirname, 'chatbot/modules');

require("fs").readdirSync(normalizedPath).forEach(function(file) {
    bot.module(require("./chatbot/modules/" + file));
});

bot.start(process.env.PORT || 5000);