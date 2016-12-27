'use strict';
const FlightSchedule = require('../models/FlightSchedule');
const Route = require('../models/Route');
const Boarding = require('../models/Boarding');
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
            qb.whereRaw("age(boarding_time, ?) <= ?",[currentTime, '02:00:00'])
        }).fetchAll({debug:true, withRelated:['route',{ flight_booking: function (qb) {
            qb.where('Booking.is_remind','=',false)
        }},'flight_booking.passenger']})
            .then(function (model) {
                callback(null, model.toJSON());
            }).catch(function(e){
            callback(e, null);
        });
    },
    boardingPass(callback) {
        Boarding
            //debug: true,
            .fetchAll({withRelated: ['booking','booking.fightSchedule','passenger']})
            .then(function (model) {
                model.forEach(function (boarding) {
                    console.log(boarding.related('booking'));
                });
                callback(null, model.toJSON())
            }).catch(function (e) {
                callback(e, null)
        });
    }
};