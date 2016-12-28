const Booking = require('../models/Booking');
const datetime = require('node-datetime');

function updateCheckInRemind(bookingId, callback) {
    new Booking({'booking_id': bookingId}).save({
        is_remind: true
    }).then(function (model) {
        callback(null, model.toJSON());
    }).catch(function (e) {
        callback(e, null);
    });
}

function updateBoardingPass(bookingId, callback) {
    new Booking({'booking_id': bookingId}).save({
        is_boardingpass: true
    }).then(function (model) {
        callback(null, model.toJSON());
    }).catch(function (e) {
        callback(e, null);
    });
}

function getCheckInDetail(passengerId, bookingId, callback) {
    Booking.query(function (qb) {
        qb.select('b.*', 'p.*', 'f.*','r.*')
            .from('Booking as b')
            .innerJoin('Passenger as p','p.passenger_id','b.passenger_id')
            .innerJoin('FlightSchedule as f', 'f.flight_id','b.flight_id')
            .innerJoin('Route as r','r.route_id','f.route_id')
            .where('b.passenger_id','=',passengerId)
            .where('b.booking_id','=',bookingId)
            .whereNull('b.checkin_time')
    }).fetch().then(function (model) {
        callback(null, model);
    }).catch(function (e) {
        callback(e, null);
    });
}

function updateCheckInStatus(passengerId, bookingId, callback) {
    const checkInTime = datetime.create().format('Y-m-d H:M:S');
    new Booking({passenger_id: passengerId, booking_id: bookingId}).save({
        is_remind: true,
        checkin_time: checkInTime
    }).then(function (model) {
        callback(null, model.toJSON());
    }).catch(function (e) {
        callback(e, null);
    });
}
module.exports = {
    updateCheckInRemind: updateCheckInRemind,
    updateBoardingPass: updateBoardingPass,
    getCheckInDetail: getCheckInDetail,
    updateCheckInStatus: updateCheckInStatus
};