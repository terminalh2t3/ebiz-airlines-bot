'use strict';

// Setting for postgres
const pg = require('pg');
pg.defaults.ssl = true;
const express = require('express');
const config = require('config');
const cron = require('node-cron');
const template = require('./chatbot/business/airlinesBot');
const bot = module.exports = require('./bot');
const path = require('path');

// Setting up web
const lessMiddleware = require('less-middleware');
bot.app.use(lessMiddleware(path.join(__dirname, './http/public')));
bot.app.use(express.static(path.join(__dirname, './http/public')));

// Init view and controller
bot.app.set('views', path.join(__dirname, './http/templates'));
bot.app.set('view engine', 'ejs');
const Route = require('./http/routes');
const route = new Route(bot.app);

// Setting up bot module folder
const normalizedPath = require('path').join(__dirname, 'chatbot/modules');
require("fs").readdirSync(normalizedPath).forEach(function(file) {
    bot.module(require("./chatbot/modules/" + file));
});

// Start bot
bot.start(process.env.PORT || 5000);

// Set white list for this domain
const rootUrl = (process.env.ROOT_URL) ? process.env.ROOT_URL : config.get('root-url');
bot.setWhiteListDomain([rootUrl]);

// Setting cron job
const task = cron.schedule('* * * * *', function() {
    template.cronCheckInRemind();
    template.cronBoardingPass();
}, false);

// Start task
task.start();