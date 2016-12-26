'use strict';
const FlightSchedule = require('../models/FlightSchedule');
const Route = require('../models/Route');
function findFlights(from, to , date, callback) {
    FlightSchedule.query(function (qb) {
        qb.innerJoin('Route', 'FlightSchedule.route_id', 'Route.route_id');
        qb.where('Route.depart_code', '=', from);
        qb.where('Route.destination_code', '=', to);
        qb.where('FlightSchedule.flight_date', '=', date);
    }).fetchAll(
        {withRelated: ['route']}
    ).then(function (model) {
        callback(null, model.toJSON());
    }).catch(function(e){
        callback(e, null);
    });
}

function checkInReminder(callback) {
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
}

module.exports = {
    findFlight: findFlights, checkInReminder: checkInReminder
};