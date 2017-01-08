'use strict';
const Flight = require('../models/Flight');
const Route = require('../models/Route');
const DateTime = require('node-datetime');
const moment = require("moment");
module.exports = {
    findFlights(from, to, date, callback) {
        const fromDateTime = date;
        const toDateTime = DateTime.create(date).format('Y-m-d 23:59:59');
        Flight.query(function (qb) {
            qb.innerJoin('Route', 'Flight.route_id', 'Route.route_id');
            qb.where('Route.depart_code', '=', from);
            qb.where('Route.destination_code', '=', to);
            qb.where('Flight.departure_time', '>=', fromDateTime);
            qb.where('Flight.departure_time', '<=', toDateTime);
        }).fetchAll(
            { withRelated: ['route'] }
        ).then(function (model) {
            callback(null, model.toJSON());
        }).catch(function (e) {
            callback(e, null);
        });
    },
    getFlightById(flight_id, callback){
        Flight.where({id: flight_id})
            .fetch({withRelated: ['route','departure','destination']})
            .then(function(model){
                callback(null, model.toJSON());
            }).catch(function (e) {
                callback(e, null);
            });
    },
    checkInReminder(callback) {
        //Get current time
        var currentTime  = DateTime.create().format('Y-m-d H:M');
        //Get all flight of current date with remind
        Flight.query(function (qb) {
            qb.whereRaw("age(departure_time, ?) < ?",[currentTime, '02:00:00']);
            qb.whereRaw("age(departure_time, ?) > ?",[currentTime, '00:45:00']);
        }).fetchAll({debug:false, withRelated:['route',{ flight_booking: function (qb) {
            qb.where('Booking.is_remind','=',false);
            qb.whereNull('Booking.checkin_time');
        }},'flight_booking.passenger']})
            .then(function (model) {
                callback(null, model ? model.toJSON() : null);
            }).catch(function(e){
                callback(e, null);
        });
    },
    boardingPassToPassenger(flightId, bookingId, callback){
        Flight.query({where: {flight_id: flightId}})
            .fetch({debug: false, withRelated: ['route',{flight_booking: function (qb) {
            qb.where('Booking.booking_id','=', bookingId);
            qb.where('Booking.is_remind','=',true);
            qb.whereNotNull('Booking.checkin_time');
        }}, "flight_booking.passenger"]})
            .then(function (model) {
                callback(null, model ? model.toJSON() : null);
            }).catch(function (e) {
                callback(e, null);
        })
    },
    boardingPass(callback) {
        //Get current time
        var currentTime  = DateTime.create().format('Y-m-d H:M');
        Flight.query(function (qb) {
            qb.whereRaw("age(departure_time, ?) < ?",[currentTime, '00:45:00']);
            qb.whereRaw("age(departure_time, ?) > ?",[currentTime, '00:15:00']);
        }).fetchAll({debug: false,withRelated: ['route',{flight_booking: function (qb) {
            qb.where('Booking.is_remind','=',true);
            qb.whereNotNull('Booking.checkin_time');
            qb.where('Booking.is_boardingpass','=',false);
        }},'flight_booking.passenger']})
            .then(function (model) {
                callback(null, model ? model.toJSON() : null);
            }).catch(function (e) {
                callback(e, null);
        });
    },
    flightUpdate(flightId, callback) {
        Flight.query(function (qb) {
            qb.where('flight_id','=',flightId);
        }).fetchAll({debug:false, withRelated: ['route', 'flight_booking','flight_booking.passenger']})
            .then(function (model) {
                callback(null, model.toJSON())
            }).catch(function (e) {
                callback(e, null)
        })
    },
    getAllFlight(callback) {
        var currentTime = DateTime.create().format("Y-m-d") + " 00:00:00";
        var endTime     = DateTime.create().format("Y-m-d") + " 23:59:00";
        Flight.query(function (qb) {
            qb.where("departure_time",">", currentTime);
            qb.where("departure_time","<", endTime);
        }).orderBy('departure_time','ASC')
        .fetchAll()
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
        Flight.findOne({flight_id: flight_id}).then(function (model) {
            let boarding_time = moment(model.get('boarding_time')).add(hour, 'hours').add(minute, 'minutes').format("YYYY-MM-DD HH:mm:ss");
            let departure_time = moment(model.get('departure_time')).add(hour, 'hours').add(minute, 'minutes').format("YYYY-MM-DD HH:mm:ss");
            let arrival_time = moment(model.get('arrival_time')).add(hour, 'hours').add(minute, 'minutes').format("YYYY-MM-DD HH:mm:ss");
            Flight.update({
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
        Flight.findOne({flight_id: flight_id}).then(function (model) {
            Flight.update({
                depart_gate: gate,
            }, {id: flight_id}).then(function (result) {
                template.sendFlightUpdate(flight_id, "gate_change");
                callback(null, result)
            }).catch(function (e) {
                callback(e, null);
            });
        }).catch(function (e) {
            callback(e, null);
        });
    },
};