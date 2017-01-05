'use strict';
const FlightScheduleBusiness = require('../../api/business/FlightScheduleBusiness');
const bot = require('../../bot/utils/get-bot');
const BookingBusiness = require('../../api/business/BookingBusiness');
const datetime = require('node-datetime');
const config = require('config');
const rootUrl = (process.env.ROOT_URL) ? process.env.ROOT_URL : config.get('root-url');
function sendCheckInRemind() {
    console.log("Cron: start remind checkin");
    FlightScheduleBusiness.checkInReminder(function (error, flights) {
        if(flights != null) {
            flights.forEach(function (flight) {
                // console.log(flight);
                const flightBooking = flight.flight_booking;
                const flightRoute = flight.route;
                //prepare payload to send checkin message
                if (flightBooking != null) {
                    flightBooking.forEach(function (booking) {
                        if (booking) {

                            let flight_info = [];
                            let info = {};
                            const passenger = booking.passenger;
                            const recipientId = passenger.facebook_id;
                            const booking_number = booking.booking_number;
                            //Flight number
                            info.flight_number = flight.flight_code;
                            //depart info
                            info.departure_airport = {
                                airport_code: flightRoute.depart_code,
                                city: flightRoute.depart_name,
                                terminal: flight.depart_terminal,
                                gate: flight.depart_gate
                            };
                            //arrival info
                            info.arrival_airport = {
                                airport_code: flightRoute.destination_code,
                                city: flightRoute.destination_name,
                                terminal: flight.destination_terminal,
                                gate: flight.destination_gate
                            };
                            //flight schedule info
                            const boarding_time = datetime.create(flight.boarding_time).format('Y-m-d\TH:M');
                            const departure_time = datetime.create(flight.departure_time).format('Y-m-d\TH:M');
                            const arrival_time = datetime.create(flight.arrival_time).format('Y-m-d\TH:M');
                            // console.log(boarding_time, departure_time, arrival_time);
                            info.flight_schedule = {
                                boarding_time: boarding_time,
                                departure_time: departure_time,
                                arrival_time: arrival_time
                            };
                            flight_info.push(info);

                            BookingBusiness.updateCheckInRemind(booking.booking_id, function (error, updateBooking) {
                                if(updateBooking) {
                                    console.log("Update check-in remind status: " + updateBooking.booking_id)
                                }
                            });
                            const checkin_url = rootUrl +"/checkin?passenger=" + passenger.passenger_id + "&booking=" + booking.booking_id;
                            bot.sendTypingIndicator(recipientId, 15000);
                            setTimeout(() => bot.sendCheckinReminder(recipientId, booking_number, flight_info, checkin_url, 6000));
                        }
                    })
                }
            });
        }
    });
}

function boardingPassOnePassenger(flightId, bookingId) {
    FlightScheduleBusiness.boardingPassToPassenger(flightId, bookingId, function (error, flight) {
        if(flight != null) {
            var boardingText = "You have checked-in. Here is you ticket and hope you have a happy flight :)";
            boardingPassProcess(flight, boardingText, false);
        } else {
            console.log('Cron: no flight to boarding')
        }
    })
}

function sendBoardingPass() {
    console.log("Cron: start remind boarding");
    FlightScheduleBusiness.boardingPass(function (error, flights) {
        if(flights != null) {
            flights.forEach(function (flight) {
                var boardingText = "Here it is! Your boarding pass. Keep it handy and it'll " +
                    "fly you through the airport. Hurry up and get on board now!";
                boardingPassProcess(flight, boardingText, true);
            });
        } else{
            console.log('Cron: no flights to remind');
        }
    })
}

function boardingPassProcess(flight, boardingText, cron) {
    var flightBooking = flight.flight_booking;
    var flightRoute   = flight.route;
    if(flightBooking != null) {
        flightBooking.forEach(function (booking) {
            if(booking) {
                var boardingPass = [];
                var info         = {};
                var passenger    = booking.passenger;
                var passenger_name = passenger.first_name;
                var recipientId    = passenger.facebook_id;
                //Boarding pass info
                info.passenger_name   = passenger_name;
                info.pnr_number       = booking.booking_number;
                info.travel_class     = booking.travel_class;
                info.seat             = booking.seat_number;
                //flight schedule time
                var boarding       = datetime.create(flight.boarding_time).format('H:M');
                var boarding_time  = datetime.create(flight.boarding_time).format('Y-m-d\TH:M');
                var departure      = datetime.create(flight.departure_time).format('n d H:M');
                var departure_time = datetime.create(flight.departure_time).format('Y-m-d\TH:M');
                //var gate_closing   = datetime.create(flight.departure_time - datetime.create("00:15:00")).format('Y-m-d\TH:M');
                var arrival_time   = datetime.create(flight.arrival_time).format('Y-m-d\TH:M');
                info.auxiliary_fields = [
                    { label: "Flight", value: flight.flight_code},
                    { label: "Boarding", value: boarding },
                    { label: "Departure", value: departure},
                ];
                info.secondary_fields = [
                    { label: "Terminal", value: flight.depart_terminal},
                    { label: "Gate", value: flight.depart_gate},
                    { label: "Seat", value: booking.seat_number }
                ];
                info.logo_image_url   = rootUrl + "/images/logo-white.png";
                info.qr_code = booking.qr_code;
                info.above_bar_code_image_url = "";

                //flight schedule info
                info.flight_info = {
                    flight_number: flight.flight_code,
                    departure_airport: {
                        airport_code: flightRoute.depart_code,
                        city: flightRoute.depart_name,
                        terminal: flight.depart_terminal,
                        gate: flight.depart_gate
                    },
                    arrival_airport: {
                        airport_code: flightRoute.destination_code,
                        city: flightRoute.destination_name,
                    },
                    flight_schedule: {
                        boarding_time: boarding_time,
                        departure_time: departure_time,
                        arrival_time: arrival_time
                    }
                };
                boardingPass.push(info);
                if(cron) {
                    BookingBusiness.updateBoardingPass(booking.booking_id, function (error, updateBooking) {
                        if(updateBooking)
                            console.log("Send auto boarding pass: "+updateBooking.booking_id);
                    });
                }
                bot.sendTypingIndicator(recipientId, 15000);
                setTimeout(() => bot.sendBoardingPass(recipientId, boardingText, boardingPass, {typing: true}), 3500);
            }
        });
    }
}
function sendFlightUpdate(flightId, updateType) {
    FlightScheduleBusiness.flightUpdate(flightId, function (error, flights) {
        flights.forEach(function (flight) {
            var flightBooking = flight.flight_booking;
            var flightRoute   = flight.route;
            if(flightBooking != null) {
                flightBooking.forEach(function (booking) {
                    if(booking) {
                        var update_flight_info = {};
                        var passenger   = booking.passenger;
                        var recipientId = passenger.facebook_id;
                        var booking_number = booking.booking_number;
                        //Flight number
                        update_flight_info.flight_number = flight.flight_code;
                        //Depart info
                        update_flight_info.departure_airport = {
                            airport_code : flightRoute.depart_code,
                            city : flightRoute.depart_name,
                            terminal : flight.depart_terminal,
                            gate: flight.depart_gate
                        };
                        //Arrival info
                        update_flight_info.arrival_airport = {
                            airport_code : flightRoute.destination_code,
                            city : flightRoute.destination_name,
                            terminal : flight.destination_terminal,
                            gate : flight.destination_gate
                        };
                        //flight delay schedule info
                        var boarding_time  = datetime.create(flight.boarding_time).format('Y-m-d\TH:M');
                        var departure_time = datetime.create(flight.departure_time).format('Y-m-d\TH:M');
                        var arrival_time   = datetime.create(flight.arrival_time).format('Y-m-d\TH:M');
                        update_flight_info.flight_schedule = {
                            boarding_time: boarding_time,
                            departure_time: departure_time,
                            arrival_time: arrival_time
                        };
                        console.log("Send Flight Update Info: "+ flightId);
                        bot.sendTypingIndicator(recipientId, 15000);
                        setTimeout(() => bot.sendFlightUpdate(recipientId, updateType, booking_number, update_flight_info,[]), 4000);
                    }
                })     
            }
        });
    });
}
module.exports = {
    sendCheckinRemind: sendCheckInRemind,
    boardingPassOnePassenger: boardingPassOnePassenger,
    sendBoardingPass: sendBoardingPass,
    sendFlightUpdate: sendFlightUpdate
};
