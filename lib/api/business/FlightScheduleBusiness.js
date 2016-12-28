'use strict';
const FlightSchedule = require('../models/FlightSchedule');
const Route = require('../models/Route');
const Boarding = require('../models/Boarding');
const moment = require("moment");
module.exports = {
    findFlights(from, to, date, callback) {
        FlightSchedule.query(function (qb) {
            qb.innerJoin('Route', 'FlightSchedule.route_id', 'Route.route_id');
            qb.where('Route.depart_state', '=', from);
            qb.where('Route.destination_state', '=', to);
            qb.where('FlightSchedule.flight_date', '=', date);
            qb.where('FlightSchedule.departure', '>', '00:00:00');
        }).fetchAll(
            { withRelated: ['route'] }
        ).then(function (model) {
            callback(null, model.toJSON());
        }).catch(function (e) {
            callback(e, null);
        });
    },
    getFlightById(flight_id, callback){
        FlightSchedule.where('flight_id', '=', flight_id)
            .fetch({withRelated: ['route']})
            .then(function(model){
                callback(null, model.toJSON());
            }).catch(function (e) {
                callback(e, null);
            });
    },
    checkInReminder(callback) {
        var datetime = new Date();
        //Get current date
        var currentDate  = datetime.getFullYear() + "-" + (datetime.getMonth()+1) + "-" + datetime.getDate();
        //Get current time
        var currentTime  = datetime.getFullYear() + "-" + (datetime.getMonth()+1) + "-" + datetime.getDate() + " " + datetime.getHours() + ":" + datetime.getMinutes();
        //Get all flight of current date with remind
        FlightSchedule.query(function (qb) {
            qb.where('flight_date', '=', currentDate);
            qb.whereRaw("age(boarding_time, ?) < ?",[currentTime, '02:00:00']);
        }).fetchAll({debug:true, withRelated:['route',{ flight_booking: function (qb) {
            qb.where('Booking.is_remind','=',false);
            qb.whereNull('Booking.checkin_time');
        }},'flight_booking.passenger']})
            .then(function (model) {
                callback(null, model.toJSON());
            }).catch(function(e){
                callback(e, null);
        });
    },
    boardingPassToPassenger(flightId, bookingId, callback){
        FlightSchedule.query({where: {flight_id: flightId}})
            .fetch({debug: true, withRelated: ['route',{flight_booking: function (qb) {
            qb.where('Booking.booking_id','=', bookingId);
            qb.where('Booking.is_remind','=',true);
            qb.whereNotNull('Booking.checkin_time');
        }}, "flight_booking.passenger"]})
            .then(function (model) {
                callback(null, model.toJSON());
            }).catch(function (e) {
                callback(e, null);
        })
    },
    boardingPass(callback) {
        var datetime = new Date();
        //Get current date
        var currentDate  = datetime.getFullYear() + "-" + (datetime.getMonth()+1) + "-" + datetime.getDate();
        //Get current time
        var currentTime  = datetime.getFullYear() + "-" + (datetime.getMonth()+1) + "-" + datetime.getDate() + " " + datetime.getHours() + ":" + datetime.getMinutes();
        FlightSchedule.query(function (qb) {
            qb.where('flight_date', '=', currentDate);
            qb.whereRaw("age(boarding_time, ?) <= ?",[currentTime, '00:45:00']);
        }).fetchAll({debug: true,withRelated: ['route',{flight_booking: function (qb) {
            qb.where('Booking.is_remind','=',true);
            qb.whereNotNull('Booking.checkin_time');
        }},'flight_booking.passenger']})
            .then(function (model) {
                callback(null, model.toJSON());
            }).catch(function (e) {
                callback(e, null);
        });
    },
    flightUpdate(flightId, callback) {
        var datetime = new Date();
        //Get current date
        var currentDate  = datetime.getFullYear() + "-" + (datetime.getMonth()+1) + "-" + datetime.getDate();
        FlightSchedule.query(function (qb) {
            qb.where('flight_id','=',flightId);
            qb.where('flight_date','=', currentDate);
        }).fetchAll({debug:true, withRelated: ['route', 'flight_booking','flight_booking.passenger']})
            .then(function (model) {
                callback(null, model.toJSON())
            }).catch(function (e) {
                callback(e, null)
        })
    },
    getAllFlight(callback) {
        FlightSchedule.findAll()
            .then(function (model) {
                callback(null, model)
            }).catch(function (e) {
            callback(e, null)
        })
    },
    /**
     * Update delay time
     * @param flight_id
     * @param hour
     * @param minute
     * @param callback
     */
    updateDelayTime(flight_id, hour, minute, callback) {
        const template = require('../../../lib/bot/utils/airport-template');
        FlightSchedule.findOne({flight_id: flight_id}).then(function (model) {
            let boarding_time = moment(model.get('boarding_time')).add(hour, 'hours').add(minute, 'minutes').format("YYYY-MM-DD HH:mm:ss");
            let departure_time = moment(model.get('departure_time')).add(hour, 'hours').add(minute, 'minutes').format("YYYY-MM-DD HH:mm:ss");
            let arrival_time = moment(model.get('arrival_time')).add(hour, 'hours').add(minute, 'minutes').format("YYYY-MM-DD HH:mm:ss");
            FlightSchedule.update({
                boarding_time: boarding_time,
                departure_time: departure_time,
                arrival_time: arrival_time
            }, {id: flight_id}).then(function (result) {
                template.sendFlightUpdate(flight_id, "delay");
                callback(null, result)
            }).catch(function (e) {
                callback(e, null);
            });
        }).catch(function (e) {
            callback(e, null);
        });
    },

    /**
     * Update gate change
     * @param flight_id
     * @param gate
     * @param callback
     */
    updateGateChange(flight_id, gate, callback) {
        const template = require('../../../lib/bot/utils/airport-template');
        FlightSchedule.findOne({flight_id: flight_id}).then(function (model) {
            FlightSchedule.update({
                depart_gate: gate,
            }, {id: flight_id}).then(function (result) {
                template.sendFlightUpdate(flight_id, "gate_changed");
                callback(null, result)
            }).catch(function (e) {
                callback(e, null);
            });
        }).catch(function (e) {
            callback(e, null);
        });
    },
};