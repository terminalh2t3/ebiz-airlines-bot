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
            if(exist){
                bookingFlight(flightSfid, fbId, chat, res);
            } else{
                //create passenger
                const info = event.payment.requested_user_info;
                Passenger.createPassenger(fbId, info.contact_name, info.contact_phone, info.contact_email, function(error, data){
                    if(error == null){
                        bookingFlight(flightSfid, fbId, chat, res);
                    } else{
                        console.log(error);
                    }
                });
            }
        });
    });
};

function bookingFlight(flightSfid, fbId, chat, res){
    chat.sendTypingIndicator(15000);
    //TODO: next in here
    Passenger.getPassengerByFacebookId(fbId, function(error, passenger){
        const passengerSfid = passenger.sfid;
        BookingBusiness.validateBooking(passengerSfid, flightSfid, function(error, valid){
            if(valid) {
                BookingBusiness.bookFlight(flightSfid, passengerSfid, function (error, resp) {
                    if (error != null) {
                        console.log(error);
                    } else {
                        chat.sendTextMessage('Thank you for your choosing Ebiz Airlines. We are so excited' +
                            ' to have you on board soon.', null, {typing: true});
                        airlinesBot.sendItinerary(fbId, passengerId, flightId, (error, data) => {
                            console.log(data);
                        });
                    }
                });
            } else{
                const ask = (convo) => {
                    convo.ask({
                        text: 'You\'ve booked this flight already. Do you need to resend the itinerary?',
                        quickReplies: ['Yes', 'No']
                    }, (payload, convo) => {
                        const text = payload.message.text;
                        if(text == 'Yes'){
                            airlinesBot.sendItinerary(fbId, passengerId, flightId, (error, data) => {
                                console.log(data);
                            })
                        } else{
                            chat.say('Ok. If you need further information, please type \'help\'');
                        }
                    });
                }

                //Start the conversation
                chat.conversation((convo) => {
                    ask(convo);
                });
            }
        });
    });
}
