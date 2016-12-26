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

bot.startWeb();
bot.start(process.env.PORT || 5000);

const Route = require('./lib/api/models/Route');
const State = require('./lib/api/models/State');
const Country = require('./lib/api/models/Country');
const FlightSchedule = require('./lib/api/models/FlightSchedule');
const RouteTest = require('./lib/api/models/Route');
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


bot.app.get('/getroute',function(req, res) {
    Route.query(function(qb) {
        qb.select('r.*', 's1.state_code', 's2.state_code')
            .from('Route as r')
            .innerJoin('State as s1','r.depart_state', 's1.state_code' )
            .innerJoin('State as s2','r.destination_state','s2.state_code')
            .where('s1.postal_code', '=', '700000')
            .where('s2.postal_code', '=', '550000')
        }).fetch({debug:true}).then(function(result) {
            console.log(result);
        })
    });
