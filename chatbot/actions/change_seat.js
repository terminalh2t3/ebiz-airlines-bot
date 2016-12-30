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
            let seat = (entities.seat_number) ? entities.seat_number[0].value : null;
            if(seat == null && (context.missingSeatNumber || context.invalidSeat || context.belongToOther)){
                seat = text;
            }
            const recipientId = bot.sessions[sessionId].fbid;
            PassengerBusiness.getPassengerByFacebookId(recipientId, function (err, passenger) {
                if(err == null) {
                    const passengerId = passenger.passenger_id;
                    BookingBusiness.getBookingByPassengerId(passengerId, function (err1, booking) {
                        const flightId = booking.flightSchedule.flight_id;
                        if (seat) {
                            BookingBusiness.checkValidSeat(flightId, seat, function (err2, valid) {
                                if (valid == true) {
                                    BookingBusiness.checkSeatStatus(flightId, seat, function (err3, status) {
                                        if (err3 == null) {
                                            if (status == 'reserved') {
                                                context.belongToOther = true;
                                                delete context.changedSeat;
                                                delete context.missingSeatNumber;
                                                delete context.invalidSeat;
                                                resolve(context);
                                            } else if (status == 'empty') {
                                                PassengerBusiness.getNearBooking(passengerId, function(error, booking){
                                                    if(booking == null){
                                                        context.noBooking = true;
                                                        delete context.missingSeatNumber;
                                                        delete context.belongToOther;
                                                        delete context.invalidSeat;
                                                        context.done = true;
                                                        resolve(context);
                                                    } else {
                                                        BookingBusiness.changeSeat(booking.booking_id, seat, function (error, callback) {
                                                            context.changedSeat = true;
                                                            delete context.missingSeatNumber;
                                                            delete context.belongToOther;
                                                            delete context.invalidSeat;
                                                            context.done = true;
                                                            resolve(context);
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });
                                } else {
                                    context.invalidSeat = true;
                                    delete context.changedSeat;
                                    delete context.missingSeatNumber;
                                    delete context.belongToOther;
                                    resolve(context);
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
                }
            });
        });
    }
});