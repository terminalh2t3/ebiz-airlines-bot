'use strict';

const pg = require('pg');
pg.defaults.ssl = true;

const config = require('config');

const bot = require('./lib/bot/utils/get-bot');

//Load all modules from modules folder
const normalizedPath = require('path').join(__dirname, 'chatbot/modules');
const MVC = require('path').join(__dirname, 'http/public');
require("fs").readdirSync(normalizedPath).forEach(function(file) {
    bot.module(require("./chatbot/modules/" + file));
});

const rootUrl = (process.env.ROOT_URL) ? process.env.ROOT_URL : config.get('root-url');
bot.startWeb();
bot.start(process.env.PORT || 5000);
bot.setWhiteListDomain([rootUrl]);

// const template = require('./lib/bot/utils/airport-template');
// //Run cron for sending check-in reminder.
//
// const cron = require('node-cron');
// const task = cron.schedule('* * * * *', function() {
//     template.sendCheckinRemind();
//     template.sendBoardingPass();
// }, false);
//
// task.start();


const Route = require('./lib/api/models/Route');
const State = require('./lib/api/models/State');
const Country = require('./lib/api/models/Country');
const FlightSchedule = require('./lib/api/models/FlightSchedule');
const Booking = require('./lib/api/models/Booking');