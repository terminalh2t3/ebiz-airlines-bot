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
     * List delay flight
     * @param req
     * @param res
     * @param next
     */
    updateDelayList: function (req, res, next) {
        const FlightSchedule = require('../../lib/api/business/FlightBusiness');
        FlightSchedule.getAllFlight(function (error, result) {
            res.render('flight/delay', {
                flights: result,
                page_name: 'delay',
                moment: moment
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
        const flights = req.body.flight;
        const FlightSchedule = require('../../lib/api/business/FlightBusiness');
        for (let key in flights) {
            let flight = flights[key];
            if(flight.delay_hour || flight.delay_minute) {
                FlightSchedule.updateDelayTime(flight.sfid, flight.delay_hour, flight.delay_minute, function (error, result) {
                    if(!error) {
                        res.redirect('/flight/update-delay');
                    }
                });
            }
        }
    },

    /**
     * Gate change list
     * @param req
     * @param res
     * @param next
     */
    updateGateChangeList: function (req, res, next) {
        const FlightSchedule = require('../../lib/api/business/FlightBusiness');
        FlightSchedule.getAllFlight(function (error, result) {
            res.render('flight/gate_change', {
                flights: result,
                page_name: 'gate',
            });
        });
    },

    /**
     * Gate change
     * @param req
     * @param res
     * @param next
     */
    updateGateChange: function (req, res, next) {
        const flights = req.body.flight;
        const FlightSchedule = require('../../lib/api/business/FlightBusiness');
        for (let key in flights) {
            let flight = flights[key];
            if(flight.gate) {
                FlightSchedule.updateGateChange(flight.sfid, flight.gate, function (error, result) {
                    if(!error) {
                        res.redirect('/flight/update-gate');
                    }
                });
            }
        }
    },
});