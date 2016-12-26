const Booking = require('../models/Booking');

function updateCheckInRemind(bookingId, callback) {
    new Booking({'booking_id': bookingId}).save({
        is_remind: true
    }).then(function (model) {
        callback(null, model.toJSON());
    }).catch(function (e) {
        callback(e, null);
    });
}

module.exports = {
    updateCheckInRemind: updateCheckInRemind
};