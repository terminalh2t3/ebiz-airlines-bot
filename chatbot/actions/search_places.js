'use strict';
const GooglePlaces = require('../../lib/bot/utils/googlePlaces');
module.exports = (bot) => ({
    getPlaces({context, entities, sessionId, text})
    {
        return new Promise(function (resolve, reject) {
            console.log('Wit - Find places text: ' + text);
            if(entities == null){
                return reject();
            }
            const recipientId = bot.sessions[sessionId].fbid;
            bot.sendTypingIndicator(recipientId, 15000)

            //Validate AI
            if (entities.intent != null ||
                context.missingLocation != null ||
                context.requireCurrentLocation != null ||
                context.missingQuery != null
            ) {

                //Save value to context
                if (entities.local_search_query) context.query = entities.local_search_query[0].value;
                if (entities.number) context.lat = entities.number[0].value;
                if (entities.number) context.long = entities.number[1].value;
                if (entities.location) context.location = entities.location[0].value;
                let query2 = null;
                if (entities.local_search_query && entities.local_search_query.length > 1) {
                    query2 = entities.local_search_query[1].value;
                    if(query2 != null) context.location = query2;
                }

                //Check current location case
                if((context.location.indexOf('here') > -1 ||
                    context.location.indexOf(' me') > -1 ||
                    context.location.indexOf('current location') > -1) &&
                    context.lat == null &&
                    context.long == null)
                {
                    context.requireCurrentLocation = true;

                    delete context.missingQuery;
                    delete context.foundPlaces;
                    delete context.missingLocation;
                    return resolve(context);
                }
                else if (context.query == null) {
                    context.missingQuery = true;
                    delete context.foundPlaces;
                    delete context.requireCurrentLocation;
                    delete context.missingLocation;
                    return resolve(context);
                }
                else if (context.location == null) {
                    context.missingLocation = true;
                    delete context.foundPlaces;
                    delete context.requireCurrentLocation;
                    delete context.missingQuery;
                    return resolve(context);
                } else {
                    //search
                    let func = "textSearch";
                    let parameter = {query: context.query + 'in' + context.location};
                    if(context.lat && context.long){
                        func = "nearBySearch";
                        parameter = {
                            location: [context.lat, context.long],
                            type: 'hotel',
                            radius: 2000,
                        }
                    }
                    GooglePlaces[func](parameter, function (error, response) {
                        const results = response.results;
                        if(results.length == 0){
                            setTimeout(() => bot.sendTextMessage(recipientId, "Sorry. I could not " +
                                "find any " + context.query + " for you. Could you try again?" , null, {typing: true}), 2000);

                            context.noResult = true;
                            delete context.foundPlaces;
                            delete context.requireCurrentLocation;
                            delete context.missingQuery;
                            context.done = true;
                            return resolve(context);
                        } else{
                            //print the generic template
                            let elements = [];
                            for(let i = 0; i < 5; i++){
                                let aResult = results[i];
                                if(!aResult.photos){
                                    continue;
                                }
                                const parameters = {
                                    photoreference: aResult.photos[0].photo_reference,
                                    sensor: false
                                };
                                let cheerio = require('cheerio');
                                let $ = cheerio.load(aResult.photos[0].html_attributions[0]);
                                GooglePlaces.imageFetch(parameters, function(error, imageRes){
                                    const element = {
                                        "title": aResult.name,
                                        "image_url": imageRes,
                                        "subtitle": aResult.formatted_address,
                                        "buttons":[
                                            {
                                                "type": "web_url",
                                                "url": $('a').attr('href'),
                                                "webview_height_ratio": "full",
                                                "title": 'View map'
                                            }
                                        ]
                                    };
                                    elements.push(element);
                                });
                            }

                            //send
                            setTimeout(() => bot.sendGenericTemplate(recipientId, elements, {typing: true}), 3000);
                            context.foundPlaces = true;

                            delete context.missingLocation;
                            delete context.requireCurrentLocation;
                            delete context.missingQuery;
                            context.done = true;
                            return resolve(context);
                        }
                    });
                }
            } else{
                return reject();
            }
        });
    },
    getCurrentLocation({context, entities, sessionId, text}){
        return new Promise(function (resolve, reject) {
            if(sessionId == null){
                return reject();
            }
            const recipientId = bot.sessions[sessionId].fbid;
            const quickReplies = [{content_type: 'location'}];
            setTimeout(() => bot.sendTextMessage(recipientId, "OK, please allow me to get your location.", quickReplies, {typing: true}), 2000);
            return resolve(context);
        });
    }
});