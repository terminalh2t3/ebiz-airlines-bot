"use strict";
/**
 * @param bot Bootbot
 */
const BookingBusiness = require('../../lib/api/business/BookingBusiness');

module.exports = (bot) => ({
    changeSeat({context, entities, sessionId, text})
    {
        return new Promise(function (resolve, reject) {
            const seat = (entities.seat_number) ? entities.location[0].seat_number : null;
            const flightId = bot.sessions[sessionId].flightId;
            if(seat) {
                BookingBusiness.checkValidSeat(flightId, seat, function (error, valid) {
                    if(error == null && valid == true) {
                        BookingBusiness.checkSeatStatus(flightId, seat, function (error, status) {
                            if(status == 'reserved') {
                                context.belongToOther = true;
                                delete context.changedSeat;
                                delete context.missingSeatNumber;
                                delete context.invalidSeat;
                            } else if(status == 'empty') {
                                context.changedSeat = true;
                                delete context.missingSeatNumber;
                                delete context.belongToOther;
                                delete context.invalidSeat;
                                resolve(context);
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
        });
    }
});