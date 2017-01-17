"use strict";
const BaseController = require("./Base");
const ejs = require('ejs');
const template = require('../../chatbot/business/airlinesBot');
const BookingBusiness = require('../../lib/business/BookingBusiness');

module.exports = BaseController.extend({
    name: "Home",
    content: null,
    checkinPage: function (req, res, next) {
        const passengerSfId = req.query.passenger;
        const bookingSfId   = req.query.booking;
        const datetime = require('node-datetime');
        const url = require('url');
        BookingBusiness.getCheckInDetail(bookingSfId, passengerSfId, function (error, model) {
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
        const passengerSfid = req.body.passenger_sfid;
        const flightSfid    = req.body.flight_sfid;
        const bookingSfid   = req.body.booking_sfid;
        BookingBusiness.updateCheckInStatus(bookingSfid, function (error, model) {
            if(model) {
                //Send Boarding Pass
                setTimeout(function () {
                    console.log("Update checkin status for passenger" + passengerSfid);
                    template.boardingPassOnePassenger(flightSfid, bookingSfid);
                }, 10000);
                res.send(true);
            }
        });
    },
    checkinSuccess: function (req, res, next) {
        res.render('flight/checkin_success');
    }
});