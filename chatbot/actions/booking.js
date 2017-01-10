"use strict";
/**
 * @param bot Bootbot
 */
const FlightScheduleBusiness = require('../../lib/api/business/FlightBusiness');
const DateTime = require('node-datetime');
module.exports = (bot) => ({
    showBookingTicket({context, entities, sessionId, text})
    {
        return new Promise(function (resolve, reject) {
            //init
            context.data = (typeof context.data === 'undefined') ? {} : context.data;
            context.data.fromLocation = (typeof context.data.fromLocation === 'undefined') ? null : context.data.fromLocation;
            context.data.toLocation = (typeof context.data.toLocation === 'undefined') ? null : context.data.toLocation;
            context.data.dateTime = (typeof context.data.dateTime === 'undefined') ? null : context.data.dateTime;

            //get data from entities
            const fromLocation = getLocation(context, entities, text, 'from');
            const toLocation = getLocation(context, entities, text, 'to');
            const dateTime = (entities.datetime) ? entities.datetime[0].value : null;

            //save data to context
            if(!(context.data.fromLocation) && fromLocation){
                context.data.fromLocation = fromLocation;
            }
            if(!(context.data.toLocation) && toLocation){
                context.data.toLocation = toLocation;
            }
            if(!(context.data.dateTime) && dateTime){
                context.data.dateTime = dateTime;
            }
            const recipientId = bot.sessions[sessionId].fbid;
            if(context.data.fromLocation && context.data.toLocation && context.data.dateTime){
                //Send the ticket list
                bot.sendTextMessage(recipientId, 'OK! I will find the flights for you. Please' +
                    ' keep in mind that at the moment I can not booking for you with any extra bags via Messenger but it will support soon.', null, {typing: true});
                setTimeout(() => bot.sendTypingIndicator(recipientId, 15000), 2000);
                const fromLocation = context.data.fromLocation;
                const toLocation = context.data.toLocation;
                const dateTime = context.data.dateTime;

                //standardize location
                const airportApi = require('../../lib/bot/utils/airport-api');
                airportApi.getAirport({term: fromLocation}, function(error, data){
                    const iFrom = data.airports[0].iata;
                    airportApi.getAirport({term: toLocation}, function(error, data){
                        const iTo = data.airports[0].iata;
                        const FlightSchedule = require('../../lib/api/business/FlightBusiness');
                        const fDateTime = DateTime.create(dateTime).format('Y-m-d H:M:S');
                        console.log("Finding flight from " + iFrom + ' to ' + iTo + ' at ' + dateTime);
                        FlightSchedule.findFlights(iFrom, iTo, fDateTime, function(error, data){
                            if(data == null || data.length == 0){
                                setTimeout(() => bot.sendTextMessage(recipientId, 'Sorry, we have no flight suitable for you.', null, {typing: true}), 2000);
                            } else {
                                const flights = data;
                                let elements = [];
                                const rootUrl = (process.env.ROOT_URL) ? process.env.ROOT_URL : require('config').get('root-url');
                                let max = data.length;
                                if(max > 5)
                                    max = 5;
                                for(let i = 0; i < max; i ++){
                                    let flight = flights[i];
                                    const total = flight.economyprice__c;
                                    const taxPercent = 0.1;
                                    const taxFee = Math.round(total * taxPercent);
                                    const basePrice = total - taxFee;

                                    const element = {
                                        "title": 'Booking ' + flight.name,
                                        "image_url": rootUrl + '/util/render-flight-info?flightSfid=' + flight.sfid,
                                        "buttons":[
                                            {
                                                "type":"payment",
                                                "title":"buy",
                                                "payload":flight.name + '_' + flight.sfid,
                                                "payment_summary":{
                                                    "currency":"USD",
                                                    "payment_type":"FIXED_AMOUNT",
                                                    "is_test_payment" : true,
                                                    "merchant_name":"Ebiz Airlines",
                                                    "requested_user_info":[
                                                        "contact_name",
                                                        "contact_phone",
                                                        "contact_email"
                                                    ],
                                                    "price_list":[
                                                        {
                                                            "label":"Subtotal",
                                                            "amount": basePrice
                                                        },
                                                        {
                                                            "label":"Taxes",
                                                            "amount": taxFee
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                "type": "web_url",
                                                "url": rootUrl + '/flight/show?flightSfid=' + flight.sfid,
                                                "webview_height_ratio": "full",
                                                "title": 'View detail'
                                            }
                                        ]
                                    };
                                    elements.push(element);
                                }
                                setTimeout(() => bot.sendGenericTemplate(recipientId, elements, {typing: true}), 3000);
                            }
                        });
                    });
                });


                //clear branches
                delete context.missingFrom;
                delete context.missingTo;
                delete context.missingTime;

                //set context
                context.bookingTicket = true;

                //mark to context of store is done
                context.done = true;
            } else if(!context.data.fromLocation){
                //in case of missing from location
                context.missingFrom = true;
                delete context.resultBookingTicket;
            } else if(!context.data.toLocation){
                //in case of missing destination
                context.missingTo = true;
                delete context.resultBookingTicket;
                delete context.missingFrom;
            } else if(!context.data.dateTime){
                //in case of missing datetime the customer want to fly
                context.missingTime = true;
                delete context.resultBookingTicket;
                delete context.missingFrom;
                delete context.missingTo;
            }
            return resolve(context);
        });
    }
});

function getLocation(context, entities, text, pointText){
    //Case 1: input in missing
    const casePointText = pointText == 'from' ? 'From' : 'To';
    if (context['missing' + casePointText]){
        return (entities.location) ? entities.location[0].value : null;
    }
    //Case 2: input as the following example "I want to go from Hanoi to HoChiMinh"
    else{
        const locations = entities.location;
        if(locations) {
            for (let index = 0; index < locations.length; index++) {
                const search = pointText + ' ' + locations[index].value.trim().toLowerCase();
                if (text.trim().toLowerCase().includes(search)) //matched
                {
                    return locations[index].value;
                }
            }
        }
        return null;
    }
}