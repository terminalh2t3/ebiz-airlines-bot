'use strict';
const FlightScheduleBusiness = require('../../api/business/FlightScheduleBusiness');
const bot = require('../../bot/utils/get-bot');
const BookingBusiness = require('../../api/business/BookingBusiness');
const datetime = require('node-datetime');
const url = require('url');
function sendCheckInRemind() {
    FlightScheduleBusiness.checkInReminder(function (error, flights) {
        if(flights) {
            console.log(flights);
            flights.forEach(function (flight) {
                // console.log(flight);
                var flightBooking = flight.flight_booking;
                var flightRoute = flight.route;
                //prepare payload to send checkin message
                if (flightBooking) {
                    flightBooking.forEach(function (booking) {
                        if (booking) {
                            var flight_info = [];
                            var info = {};
                            var passenger = booking.passenger;
                            var recipientId = passenger.facebook_id;
                            var booking_number = booking.booking_number;
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
                            var boarding_time = datetime.create(flight.boarding_time).format('Y-m-d\TH:M');
                            var departure_time = datetime.create(flight.departure_time).format('Y-m-d\TH:M');
                            var arrival_time = datetime.create(flight.arrival_time).format('Y-m-d\TH:M');
                            // console.log(boarding_time, departure_time, arrival_time);
                            info.flight_schedule = {
                                boarding_time: boarding_time,
                                departure_time: departure_time,
                                arrival_time: arrival_time
                            };
                            flight_info.push(info);
                            BookingBusiness.updateCheckInRemind(booking.booking_id, function (error, updateBooking) {
                                if(updateBooking)
                                    console.log("Update check-in remind status: " + updateBooking.booking_id)
                            });
                            var checkin_url = url.host+"/checkin?passenger=" + passenger.passenger_id + "&booking=" + booking.booking_id;
                            bot.sendCheckinReminder(recipientId, booking_number, flight_info, checkin_url, [])
                        }
                    })
                }
            });
        }
    });
}

function boardingPassOnePassenger(flightId, bookingId) {
    FlightScheduleBusiness.boardingPassToPassenger(flightId, bookingId, function (error, flight) {
        //console.log(flight);
        boardingPassProcess(flight);
    })
}

function sendBoardingPass() {
    FlightScheduleBusiness.boardingPass(function (error, flights) {
        flights.forEach(function (flight) {
            this.boarding_time(flight);
        });
    })
}

function boardingPassProcess(flight) {
    var flightBooking = flight.flight_booking;
    var flightRoute   = flight.route;
    if(flightBooking) {
        // console.log(flight);
        flightBooking.forEach(function (booking) {
            if(booking) {
                var boardingPass = [];
                var info         = {};
                var passenger    = booking.passenger;
                var passenger_name = passenger.first_name+" "+passenger.last_name;
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
                    { label: "Terminal", value: flight.depart_terminal},
                ];
                info.secondary_fields = [
                    { label: "Gate", value: flight.depart_gate},
                    { label: "Seat", value: booking.seat_number },
                    { label: "Sec.Nr.", value: "003" },
                ];
                info.logo_image_url   = "http://localhost:5000/images/logo.png";
                info.header_image_url = "http://localhost:5000/images/logo.png";
                info.qr_code = passenger_name + " " +booking.qr_code;
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
                console.log("Send boarding pass success to: "+ passenger_name);
                bot.sendBoardingPass(recipientId, boardingPass, []);
            }
        });
    }
}
function sendFlightUpdate(flightId, updateType) {
    FlightScheduleBusiness.flightUpdate(flightId, function (error, flights) {
        flights.forEach(function (flight) {
            var flightBooking = flight.flight_booking;
            var flightRoute   = flight.route;
            if(flightBooking) {
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
                        bot.sendFlightUpdate(recipientId, updateType, booking_number, update_flight_info,[])
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
