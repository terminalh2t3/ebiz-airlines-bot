'use strict';
const BookingBusiness = require('../../lib/api/business/BookingBusiness');
const Passenger = require('../../lib/api/business/PassengerBusiness');
const DateTime = require('node-datetime');
const airlinesBot = require('../customBot/airlinesBot');
module.exports = (bot) => {
    bot.on('payment', (event, chat, res) => {
        const flightSfid = event.payment.payload.split('_')[1];
        const fbId = event.sender.id;
        //check user
        Passenger.isHasPassenger(fbId, function(err, exist){
            if(err == null) {
                if (exist) {
                    bookingFlight(flightSfid, fbId, chat, res);
                } else {
                    //create passenger
                    const info = event.payment.requested_user_info;
                    Passenger.createPassenger(fbId, info.contact_name, info.contact_phone, info.contact_email, function (error2, data) {
                        if (error == null) {
                            bookingFlight(flightSfid, fbId, chat, res);
                        } else {
                            console.error(error2);
                        }
                    });
                }
            } else{
                console.error(err);
            }
        });
    });
};

function bookingFlight(flightSfid, fbId, chat, res){
    chat.sendTypingIndicator(15000);
    //TODO: next in here
    Passenger.getPassengerByFacebookId(fbId, function(error1, passenger){
        if(error1 == null) {
            const passengerSfid = passenger.sfid;
            BookingBusiness.validateBooking(passengerSfid, flightSfid, function (error2, valid) {
                if(error2 == null) {
                    if (valid) {
                        BookingBusiness.bookFlight(flightSfid, passengerSfid, function (error3, resp) {
                            if (error3 == null) {
                                chat.sendTextMessage('Thank you for your choosing Ebiz Airlines. We are so excited' +
                                    ' to have you on board soon.', null, {typing: true});
                                airlinesBot.sendItinerary(fbId, passengerSfid, flightSfid, (error, data) => {
                                    console.log(data);
                                });
                            } else {
                                console.error(error3);
                            }
                        });
                    } else {
                        const ask = (convo) => {
                            convo.ask({
                                text: 'You\'ve booked this flight already. Do you need to resend the itinerary?',
                                quickReplies: ['Yes', 'No']
                            }, (payload, convo) => {
                                const text = payload.message.text;
                                if (text == 'Yes') {
                                    airlinesBot.sendItinerary(fbId, passengerSfid, flightSfid, (error, data) => {
                                        console.log(data);
                                    })
                                } else {
                                    chat.say('Ok. If you need further information, please type \'help\'');
                                }
                            });
                        }

                        //Start the conversation
                        chat.conversation((convo) => {
                            ask(convo);
                        });
                    }
                } else{
                    console.error(error2);
                }
            });
        } else{
            console.error(error1);
        }
    });
}
