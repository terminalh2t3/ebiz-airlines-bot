'use strict';

const pg = require('pg');
pg.defaults.ssl = true;

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

var express    = require('express');        // call express
var app        = express();
var port = 3000;        // set our port
app.listen(port);
console.log('Magic happens on port ' + port);

var knex = require('knex')({
    client: 'pg',
    connection: (process.env.DATABASE_URL) ? process.env.DATABASE_URL : config.get('database_url'),
});

// var bookshelf = require('bookshelf')(knex);
// const Aircraft = bookshelf.Model.extend({
//     tableName: "public.Aircraft"
// });
// const FlightSchedule = bookshelf.Model.extend({
//     tableName: "public.FlightSchedule"
// });

app.get('/',function(req, res) {
    var Route = require("./lib/api/models/Route");
    var allRoute = new Route.Route().getAll();
    res.send(allRoute.toJSON());
});
app.get('/test', function(req, res) {
    Aircraft.fetchAll().then(function(model) {
       res.send(model.toJSON());
    });
});