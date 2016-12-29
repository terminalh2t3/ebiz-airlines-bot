'use strict';
const FlightSchedule = require('../models/FlightSchedule');
const Route = require('../models/Route');
const Boarding = require('../models/Boarding');
const DateTime = require('node-datetime');
module.exports = {
    findFlights(from, to, date, callback) {
        const fromDateTime = date;
        const toDateTime = DateTime.create(date).format('Y-m-d 23:59:59');
        FlightSchedule.query(function (qb) {
            qb.innerJoin('Route', 'FlightSchedule.route_id', 'Route.route_id');
            qb.where('Route.depart_code', '=', from);
            qb.where('Route.destination_code', '=', to);
            qb.where('FlightSchedule.departure_time', '>=', fromDateTime);
            qb.where('FlightSchedule.departure_time', '<=', toDateTime);
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
};