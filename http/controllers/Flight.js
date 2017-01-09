"use strict";
const BaseController = require("./Base"),
    ejs = require('ejs'),
    bodyParser = require("body-parser"),
    moment = require("moment");

module.exports = BaseController.extend({
    name: "Home",
    content: null,
    show: function(req, res, next) {
        const flightSfid = req.query.flightSfid;
        const FlightBusiness = require('../../lib/api/business/FlightBusiness');
        FlightBusiness.getFlightById(flightSfid, function(err, data){
            const DateTime = require('node-datetime');
            res.render('flight/show', {flightInfo: data, DateTime: DateTime});
        });
    },
    list: function (req, res, next) {
        const FlightSchedule = require('../../lib/api/business/FlightBusiness');
        FlightSchedule.getAllFlight(function (error, result) {
            res.render('flight/list', {
                flights: result,
                page_name: 'flight_list',
            });
        });
    },

    /**
     * Update delay flight
     * @param req
     * @param res
     * @param next
     */
    updateDelay: function (req, res, next) {

        const sfId         = req.body.sfid;
        const newDeparture = req.body.newDeparture;
        const newArrival   = req.body.newArrival;

        if(sfId && newDeparture && newArrival) {
            const template = require('../../../lib/bot/utils/airport-template');
            template.sendFlightUpdate(sfId, "delay", newDeparture, newArrival, null)
        }
    },

    /**
     * Gate change
     * @param req
     * @param res
     * @param next
     */
    updateGateChange: function (req, res, next) {

        const sfId         = req.body.sfid;
        const newGate      = req.body.newGate;

        if(sfId && newGate) {
            const template = require('../../../lib/bot/utils/airport-template');
            template.sendFlightUpdate(sfId, "gate_change", null, null, newGate)
        }
    },
});