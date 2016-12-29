"use strict";
/**
 * @param bot Bootbot
 */
const BookingBusiness = require('../../lib/api/business/BookingBusiness');
const PassengerBusiness = require('../../lib/api/business/PassengerBusiness');
module.exports = (bot) => ({
    changeSeat({context, entities, sessionId, text})
    {
        return new Promise(function (resolve, reject) {
            const seat = (entities.seat_number) ? entities.location[0].seat_number : null;
            const recipientId = bot.sessions[sessionId].fbid;
            PassengerBusiness.getPassengerByFacebookId(recipientId, function (error, passenger) {
                BookingBusiness.getBookingByPassengerId(passenger.passenger_id, function (err1, booking) {
                    const flightId = booking.flightSchedules.flight_id;
                    if(seat) {
                        BookingBusiness.checkValidSeat(flightId, seat, function (err2, valid) {
                            if(err2 == null && valid == true) {
                                BookingBusiness.checkSeatStatus(flightId, seat, function (err3, status) {
                                    if(err3 == null) {
                                        if (status == 'reserved') {
                                            context.belongToOther = true;
                                            delete context.changedSeat;
                                            delete context.missingSeatNumber;
                                            delete context.invalidSeat;
                                        } else if (status == 'empty') {
                                            context.changedSeat = true;
                                            delete context.missingSeatNumber;
                                            delete context.belongToOther;
                                            delete context.invalidSeat;
                                            resolve(context);
                                        }
                                    }
                                });
                            } else {
                                context.invalidSeat = true;
                                delete context.changedSeat;
                                delete context.missingSeatNumber;
                                delete context.belongToOther;
                            }
                        });
                    } else {
                        context.missingSeatNumber = true;
                        delete context.belongToOther;
                        delete context.changedSeat;
                        delete context.invalidSeat;
                        resolve(context);
                    }
                })
            });

        });
    }
});