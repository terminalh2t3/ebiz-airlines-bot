const BookingBusiness = require('../../lib/api/business/BookingBusiness');
const bot = require('../../lib/bot/utils/get-bot');
const DateTime = require('node-datetime');

module.exports =
{
    sendItinerary(recipientId, passengerSfid, flightSfid, callback){
        bot.sendTypingIndicator(recipientId, 15000);
        BookingBusiness.getBookingDetail(passengerSfid, flightSfid, function (error, bookingInfo) {
            if(error){
                callback(error, null);
            } else {
                const total = bookingInfo.flight.economyprice__c;
                const taxPercent = 0.1;
                const taxFee = Math.round(total * taxPercent);
                const basePrice = total - taxFee;
                const payload = {
                    "template_type": "airline_itinerary",
                    "intro_message": "Here\'s your flight itinerary.",
                    "theme_color": "#89313d",
                    "locale": "en_US",
                    "pnr_number": bookingInfo.name,
                    "passenger_info": [
                        {
                            "name": bookingInfo.passenger.name,
                            "ticket_number": bookingInfo.name,
                            "passenger_id": bookingInfo.passenger.sfid
                        }
                    ],
                    "flight_info": [
                        {
                            "connection_id": "c001",
                            "segment_id": "s001",
                            "flight_number": bookingInfo.flight.name,
                            "aircraft_type": "Airbus 320",
                            "departure_airport": {
                                "airport_code": bookingInfo.departure.code__c,
                                "city": bookingInfo.departure.city__c,
                                "terminal": 'T' + bookingInfo.flight.departureterminal__c,
                                "gate": bookingInfo.flight.departuregate__c
                            },
                            "arrival_airport": {
                                "airport_code": bookingInfo.destination.code__c,
                                "city": bookingInfo.destination.city__c,
                                "terminal": 'T' + bookingInfo.flight.destinationterminal__c,
                                "gate": bookingInfo.flight.destinationgate__c
                            },
                            "flight_schedule": {
                                "departure_time": DateTime.create(bookingInfo.flight.departuretime__c).format('y-m-dTH:M'),
                                "arrival_time": DateTime.create(bookingInfo.flight.arrivaltime__c).format('y-m-dTH:M'),
                            },
                            "travel_class": "economy"
                        }
                    ],
                    "passenger_segment_info": [
                        {
                            "segment_id": "s001",
                            "passenger_id": bookingInfo.passenger.sfid,
                            "seat": bookingInfo.seatnumber__c,
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