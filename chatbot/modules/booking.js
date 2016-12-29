'use strict';
const BookingBusiness = require('../../lib/api/business/BookingBusiness');
const Passenger = require('../../lib/api/business/PassengerBusiness');
const DateTime = require('node-datetime');
module.exports = (bot) => {
    bot.on('payment', (event, chat, res) => {
        const flightId = event.payment.payload.split('_')[1];
        const fbId = event.sender.id;
        //check user
        Passenger.isHasPassenger(fbId, function(err, exist){
            if(exist){
                bookingFlight(flightId, fbId, chat, res);
            } else{
                //create passenger
                const info = event.payment.requested_user_info;
                Passenger.createPassenger(fbId, info.contact_name, info.contact_phone, info.contact_email, function(error, data){
                    if(error == null){
                        bookingFlight(flightId, fbId, chat, res);
                    } else{
                        console.log(error);
                    }
                });
            }
        });
    });
};

function bookingFlight(flightId, fbId, chat, res){
    chat.sendTypingIndicator(20);
    Passenger.getPassengerByFacebookId(fbId, function(error, passenger){
        const passengerId = passenger.passenger_id;
        BookingBusiness.bookFlight(flightId, passengerId, function(error, data){
            if(error != null){
                console.log(error);
            } else{
                chat.sendTextMessage('Thank you for your choosing Ebiz Airlines. We are so excited' +
                    ' to have you on board soon.');
                BookingBusiness.getBookingDetail(data.booking_id, function(error, bookingInfo){
                    if(error == null){
                        res.sendStatus(200);
                        setTimeout(function(){
                            const total = bookingInfo.flightSchedule.ticket_price;
                            const taxPercent = 0.1;
                            const taxFee = Math.round(total * taxPercent);
                            const basePrice = total - taxFee;
                            const payload = {
                                "template_type": "airline_itinerary",
                                "theme_color": "#89313d",
                                "intro_message": "Here\'s your flight itinerary.",
                                "locale": "en_US",
                                "pnr_number": bookingInfo.booking_number,
                                "passenger_info": [
                                    {
                                        "name": bookingInfo.passenger.first_name,
                                        "ticket_number": bookingInfo.booking_number,
                                        "passenger_id": bookingInfo.passenger.passenger_id
                                    }
                                ],
                                "flight_info": [
                                    {
                                        "connection_id": "c001",
                                        "segment_id": "s001",
                                        "flight_number": bookingInfo.flightSchedule.flight_code,
                                        "aircraft_type": "Airbus 320",
                                        "departure_airport": {
                                            "airport_code": bookingInfo.route.depart_code,
                                            "city": bookingInfo.route.depart_name,
                                            "terminal": 'T' + bookingInfo.flightSchedule.depart_terminal,
                                            "gate": bookingInfo.flightSchedule.depart_gate
                                        },
                                        "arrival_airport": {
                                            "airport_code": bookingInfo.route.destination_code,
                                            "city": bookingInfo.route.destination_name,
                                            "terminal": 'T' + bookingInfo.flightSchedule.destination_terminal,
                                            "gate": bookingInfo.flightSchedule.destination_gate
                                        },
                                        "flight_schedule": {
                                            "departure_time": DateTime.create(bookingInfo.flightSchedule.departure_time).format('y-m-dTH:M'),
                                            "arrival_time": DateTime.create(bookingInfo.flightSchedule.arrival_time).format('y-m-dTH:M'),
                                        },
                                        "travel_class": "economy"
                                    }
                                ],
                                "passenger_segment_info": [
                                    {
                                        "segment_id": "s001",
                                        "passenger_id": bookingInfo.passenger.passenger_id,
                                        "seat": bookingInfo.seat_number,
                                        "seat_type": 'economy'
                                    }
                                ],
                                "base_price": basePrice,
                                "tax": taxFee,
                                "total_price": total,
                                "currency": "USD"
                            };
                            chat.sendTemplate(payload);
                            chat.sendOffTypingIndicator();
                        }, 10000);
                    } else{
                        res.sendStatus(500);
                    }
                });
            }
        });
    });
}
