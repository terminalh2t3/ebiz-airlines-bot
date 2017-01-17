const BookingBusiness = require('../../lib/business/BookingBusiness');
const bot = require('../../bot');
const DateTime = require('node-datetime');
const FlightBusiness = require('../../lib/business/FlightBusiness');
const datetime = require('node-datetime');
const moment = require('moment');
const config = require('config');
const rootUrl = (process.env.ROOT_URL) ? process.env.ROOT_URL : config.get('root-url');

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
                                "airport_code": bookingInfo.flight.route.departure.code__c,
                                "city": bookingInfo.flight.route.departure.city__c,
                                "terminal": 'T' + bookingInfo.flight.departureterminal__c,
                                "gate": bookingInfo.flight.departuregate__c
                            },
                            "arrival_airport": {
                                "airport_code": bookingInfo.flight.route.destination.code__c,
                                "city": bookingInfo.flight.route.destination.city__c,
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
    },
    sendCheckInRemind(){
        console.log("Cron: start remind checkin");
        FlightBusiness.checkInReminder(function (error, flights) {
            if (error == null) {
                flights.forEach(function (flight) {
                    console.log(flight);
                    const flightBooking = flight.booking;
                    const flightRoute = flight.route;
                    if (flightBooking != null) {
                        flightBooking.forEach(function (booking) {
                            if (booking) {
                                const passenger = booking.passenger;
                                const recipientId = passenger.facebookid__c;
                                const booking_number = booking.name;
                                //flight schedule info
                                const boarding_time = datetime.create(booking.boardingtime__c).format('Y-m-d\TH:M');
                                const departure_time = datetime.create(flight.departuretime__c).format('Y-m-d\TH:M');
                                const arrival_time = datetime.create(flight.arrivaltime__c).format('Y-m-d\TH:M');
                                const checkin_url = rootUrl + "/checkin?passenger=" + passenger.sfid + "&booking=" + booking.sfid;

                                const payload = {
                                    template_type   : "airline_checkin",
                                    intro_message   : "Check-in is open now: go ahead and get your boarding pass! See you soon :)",
                                    theme_color     : "#89313d",
                                    pnr_number      : booking_number,
                                    flight_info     : [
                                        {
                                            flight_number: flight.name,
                                            departure_airport: {
                                                airport_code: flightRoute.departure.code__c,
                                                city: flightRoute.departure.city__c,
                                                terminal: flight.departureterminal__c,
                                                gate: flight.departuregate__c
                                            },
                                            arrival_airport: {
                                                airport_code: flightRoute.destination.code__c,
                                                city: flightRoute.destination.city__c,
                                                terminal: flight.destinationterminal__c,
                                                gate: flight.destinationgate__c
                                            },
                                            flight_schedule: {
                                                boarding_time: boarding_time,
                                                departure_time: departure_time,
                                                arrival_time: arrival_time
                                            }
                                        }
                                    ],
                                    checkin_url: checkin_url
                                };
                                BookingBusiness.updateCheckInRemind(booking.sfid, function (error, updateBooking) {
                                    if (updateBooking) {
                                        console.log("Update check-in status for booking: " + updateBooking.sfid)
                                    }
                                });

                                bot.sendTypingIndicator(recipientId, 15000);
                                setTimeout(() => bot.sendTemplate(recipientId, payload, {typing: true}), 3000);
                            }
                        })
                    }
                });
            }
        });
    },
    boardingPassOnePassenger(flightSfId, bookingSfId) {
        FlightBusiness.boardingPassToPassenger(flightSfId, bookingSfId, function (error, flight) {
            if (flight != null) {
                const boardingText = "You have checked-in. Here is you ticket and hope you have a happy flight :)";
                that.boardingPassProcess(flight, boardingText, false);
            } else {
                console.log('Cron: no flight to boarding')
            }
        })
    },
    sendBoardingPass() {
        console.log("Cron: start remind boarding");
        FlightBusiness.boardingPass(function (error, flights) {
            if (flights != null) {
                flights.forEach(function (flight) {
                    const boardingText = "Here it is! Your boarding pass. Keep it handy and it'll " +
                        "fly you through the airport. Hurry up and get on board now!";
                    that.boardingPassProcess(flight, boardingText, true);
                });
            } else {
                console.log('Cron: no flights to remind');
            }
        })
    },
    boardingPassProcess(flight, boardingText, cron) {
        const flightBooking = flight.booking;
        const flightRoute = flight.route;
        if (flightBooking != null) {
            flightBooking.forEach(function (booking) {
                if (booking) {
                    const passenger = booking.passenger;
                    const passenger_name = passenger.name;
                    const recipientId = passenger.facebookid__c;

                    //flight schedule time
                    const boarding = datetime.create(booking.boardingtime__c).format('H:M');
                    const boarding_time = datetime.create(booking.boardingtime__c).format('Y-m-d\TH:M');
                    const departure = datetime.create(flight.departuretime__c).format('n d H:M');
                    const departure_time = datetime.create(flight.departuretime__c).format('Y-m-d\TH:M');
                    const arrival_time = datetime.create(flight.arrivaltime__c).format('Y-m-d\TH:M');

                    //Boarding pass info

                    const payload = {
                        template_type : "airline_boardingpass",
                        intro_message : boardingText,
                        theme_color   : "#89313d",
                        boarding_pass : [
                            {
                                passenger_name: passenger_name,
                                pnr_number: booking.name,
                                seat: booking.seatnumber__c,
                                auxiliary_fields: [
                                    {label: "Flight", value: flight.name},
                                    {label: "Boarding", value: boarding},
                                    {label: "Departure", value: departure}
                                ],
                                secondary_fields: [
                                    {label: "Terminal", value: flight.departureterminal__c},
                                    {label: "Gate", value: flight.departuregate__c},
                                    {label: "Seat", value: booking.seatnumber__c}
                                ],
                                logo_image_url: rootUrl + "/images/logo-white.png",
                                qr_code: booking.qrcode__c,
                                above_bar_code_image_url: "",
                                flight_info: {
                                    flight_number: flight.name,
                                    departure_airport: {
                                        airport_code: flightRoute.departure.code__c,
                                        city: flightRoute.departure.city__c,
                                        terminal: flight.departureterminal__c,
                                        gate: flight.departuregate__c
                                    },
                                    arrival_airport: {
                                        airport_code: flightRoute.destination.code__c,
                                        city: flightRoute.destination.city__c,
                                    },
                                    flight_schedule: {
                                        boarding_time: boarding_time,
                                        departure_time: departure_time,
                                        arrival_time: arrival_time
                                    }
                                }
                            }]
                    };
                    if (cron) {
                        BookingBusiness.updateBoardingPass(booking.sfid, function (error, updateBooking) {
                            if (updateBooking)
                                console.log("Send auto boarding pass: " + updateBooking.sfid);
                        });
                    }
                    bot.sendTypingIndicator(recipientId, 15000);
                    setTimeout(() => bot.sendTemplate(recipientId, payload, {typing: true}), 3500);
                }
            });
        }
    },
    sendFlightUpdate(flightSfid, updateType, newDeparture, newArrival, newGate) {
        FlightBusiness.flightUpdate(flightSfid, function (error, flights) {
            flights.forEach(function (flight) {
                const flightBooking = flight.booking;
                const flightRoute = flight.route;
                if (flightBooking != null) {
                    flightBooking.forEach(function (booking) {
                        if (booking) {
                            const passenger = booking.passenger;
                            const recipientId = passenger.facebookid__c;
                            const booking_number = booking.name;
                            let gate;
                            let boarding_time;
                            let departure_time;
                            let arrival_time;
                            //Depart info
                            if (newGate) {
                                gate = newGate;
                            } else {
                                gate = flight.departuregate__c;
                            }
                            //flight delay schedule info
                            if (newDeparture && newArrival) {
                                flight.boarding_time = moment(newDeparture).subtract(40, 'minutes').format('Y-m-d\TH:M');
                                boarding_time = flight.boarding_time;
                                departure_time = datetime.create(newDeparture).format('Y-m-d\TH:M');
                                arrival_time = datetime.create(newArrival).format('Y-m-d\TH:M');
                            } else {
                                flight.boarding_time = moment(flight.departuretime__c).subtract(40, 'minutes').format('Y-m-d\TH:M');
                                boarding_time = flight.boarding_time;
                                departure_time = datetime.create(flight.departuretime__c).format('Y-m-d\TH:M');
                                arrival_time = datetime.create(flight.arrivaltime__c).format('Y-m-d\TH:M');
                            }

                            const payload = {
                                template_type : "airline_update",
                                intro_message : "Dear traveller, your flight has been delayed. We are sorry for the extra wait! Keep an eye on the informations screens - just in case your gate number changes.",
                                theme_color   : "#89313d",
                                update_type   : updateType,
                                pnr_number    : booking_number,
                                update_flight_info : {
                                    flight_number: flight.name,
                                    departure_airport: {
                                        airport_code: flightRoute.departure.code__c,
                                        city: flightRoute.departure.city__c,
                                        terminal: flight.departureterminal__c,
                                        gate: gate
                                    },
                                    arrival_airport: {
                                        airport_code: flightRoute.destination.code__c,
                                        city: flightRoute.destination.city__c,
                                        terminal: flight.destinationterminal__c,
                                        gate: flight.destinationgate__c
                                    },
                                    flight_schedule: {
                                        boarding_time: boarding_time,
                                        departure_time: departure_time,
                                        arrival_time: arrival_time
                                    }
                                }
                            };
                            console.log("Send Flight Update Info: " + flightSfid);
                            bot.sendTypingIndicator(recipientId, 15000);
                            setTimeout(() => bot.sendTemplate(recipientId, payload, {typing: true}), 4000);
                        }
                    })
                }
            });
        });
    }
};