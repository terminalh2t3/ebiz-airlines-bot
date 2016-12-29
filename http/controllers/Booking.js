"use strict";
const BaseController = require("./Base"),
    ejs = require('ejs'),
    bodyParser = require("body-parser"),
    moment = require("moment");

module.exports = BaseController.extend({
    name: "Home",
    content: null,
    checkinPage: function (req, res, next) {
        const passengerId = req.query.passenger;
        const bookingId   = req.query.booking;
        const datetime = require('node-datetime');
        const BookingBusiness = require('../../lib/api/business/BookingBusiness');
        const url = require('url');
        BookingBusiness.getCheckInDetail(passengerId, bookingId, function (error, model) {
            if(model) {
                res.render('flight/checkin', {
                    booking: model,
                    datetime: datetime,
                    baseURL: url.hostname
                });
            } else {
                res.render('flight/checkin_success');
            }
        });
    },
    updateCheckin: function (req, res, next) {
        const passengerId = req.body.passenger_id;
        const bookingId   = req.body.booking_id;
        const flightId    = req.body.flight_id;
        const BookingBusiness = require('../../lib/api/business/BookingBusiness');
        const template = require('../../lib/bot/utils/airport-template');
        BookingBusiness.updateCheckInStatus(passengerId, bookingId, function (error, model) {
            if(model) {
                console.log("Update checkin status for passenger" + passengerId);
                //Send Boarding Pass
                template.boardingPassOnePassenger(flightId, bookingId);
                res.send(true);
            }
        });
    },
    checkinSuccess: function (req, res, next) {
        res.render('flight/checkin_success');
    }
});