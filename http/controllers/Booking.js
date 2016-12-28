"use strict";
const BaseController = require("./Base"),
    ejs = require('ejs'),
    bodyParser = require("body-parser"),
    moment = require("moment");

module.exports = BaseController.extend({
    name: "Home",
    content: null,
    checkinPage: function (req, res, next) {
        const passengerId = req.query.passenger_id;
        const bookingId   = req.query.booking_id;
        const datetime = require('node-datetime');
        const BookingBusiness = require('../../lib/api/business/BookingBusiness');
        BookingBusiness.getCheckInDetail(passengerId, bookingId, function (error, model) {
            res.render('flight/checkin', {
                booking: model,
                datetime: datetime
            });
        });
    },
    updateCheckin: function (req, res, next) {
        const passengerId = req.query.passenger_id;
        const bookingId   = req.query.booking_id;
        const BookingBusiness = require('../../lib/api/business/BookingBusiness');
        BookingBusiness.updateCheckInStatus(passengerId, bookingId, function (error, model) {
            if(model) {
                console.log("Update checkin status for passenger" + passengerId);
                res.redirect('/checkin/success');
            }
        });
    },
    checkinSuccess: function (req, res, next) {
        res.render('close');
    }
});