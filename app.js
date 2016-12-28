'use strict';

const pg = require('pg');
pg.defaults.ssl = true;

const config = require('config');

const bot = require('./lib/bot/utils/get-bot');

//Load all modules from modules folder
const normalizedPath = require('path').join(__dirname, 'chatbot/modules');

require("fs").readdirSync(normalizedPath).forEach(function(file) {
    bot.module(require("./chatbot/modules/" + file));
});

const rootUrl = (process.env.ROOT_URL) ? process.env.ROOT_URL : config.get('root-url');
bot.startWeb();
bot.start(process.env.PORT || 5000);
bot.setWhiteListDomain([rootUrl]);

const template = require('./lib/bot/utils/airport-template');
// //Run cron for sending check-in reminder.
// var cron = require('node-cron');
// var task = cron.schedule('* * * * *', function() {
//     console.log("Sent Checkin Reminder");
//     template.sendCheckinRemind();
//     //console.log('Sent boarding pass');
//     //template.sendBoardingPass();
// }, false);
//
// task.start();


const Route = require('./lib/api/models/Route');
const State = require('./lib/api/models/State');
const Country = require('./lib/api/models/Country');
const FlightSchedule = require('./lib/api/models/FlightSchedule');
const Booking = require('./lib/api/models/Booking');
const FlightBusiness = require('./lib/api/business/FlightScheduleBusiness');

bot.app.get('/',function(req, res) {
    RouteTest.findAll().then(function (model) {
        res.send(model.toJSON());
    });
});

bot.app.get('/country',function(req, res) {
    FlightBusiness.findFlight("SGN","DAD", "2016-12-26", null ,function (data) {
        data.forEach(function (value) {
            console.log(value);
            // console.log(value.relations.aircraft);
            // console.log(value.relations.route);
        })
    });
});
bot.app.get('/flightschedule',function(req, res) {
    FlightSchedule.testRelation().then(function(){

    });
});

bot.app.get('/flightschedule',function(req, res) {
    FlightSchedule.testRelation().then(function(){

    });
});


bot.app.get('/booking',function(req, res) {
    Booking.fetchAll({withRelated: ['flightSchedule']}).then(
        function (model) {
            console.log(model);
        }
    )
});
