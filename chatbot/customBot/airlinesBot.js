const BookingBusiness = require('../../lib/api/business/BookingBusiness');
const bot = require('../../lib/bot/utils/get-bot');
const DateTime = require('node-datetime');

module.exports =
{
    sendItinerary(recipientId, passengerId, flightId, callback){
        bot.sendTypingIndicator(recipientId, 15000);
        BookingBusiness.getBookingDetail(passengerId, flightId, function (error, bookingInfo) {
            if(error){
                callback(error, null);
            } else {
                const total = bookingInfo.flightSchedule.ticket_price;
                const taxPercent = 0.1;
                const taxFee = Math.round(total * taxPercent);
                const basePrice = total - taxFee;
                const payload = {
                    "template_type": "airline_itinerary",
                    "intro_message": "Here\'s your flight itinerary.",
                    "theme_color": "#89313d",
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
                setTimeout(() => bot.sendTemplate(recipientId, payload, {typing: true}), 10000);
                callback(null, true);
            }
        });
    }
};