'use strict';
const FlightScheduleBusiness = require('../../api/business/FlightScheduleBusiness');
const bot = require('../../bot/utils/get-bot');
const BookingBusiness = require('../../api/business/BookingBusiness');
const datetime = require('node-datetime');

function sendCheckInRemind() {
    FlightScheduleBusiness.checkInReminder(function (error, flights) {
        flights.forEach(function (flight) {
            //console.log(flight);
            var flightBooking = flight.flight_booking;
            var flightRoute   = flight.route;
            //prepare payload to send checkin message
            if(flightBooking) {
                flightBooking.forEach(function (booking) {
                    if(booking) {
                        var flight_info = [];
                        var info = {};
                        var checkin_url = "https://www.hasterwilliam.com/checkin";
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
                        var boarding_time  = datetime.create(flight.boarding_time).format('Y-m-d\TH:m');
                        var departure_time = datetime.create(flight.departure_time).format('Y-m-d\TH:m');
                        var arrival_time   = datetime.create(flight.arrival_time).format('Y-m-d\TH:m');
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
                        bot.sendCheckinReminder(recipientId, booking_number, flight_info, checkin_url, [])
                    }
                })
            }
        });
    });
}

function sendBoardingPass(recipientId) {

}

module.exports = {
    sendCheckinRemind: sendCheckInRemind,
    sendBoardingPass: sendBoardingPass
};
