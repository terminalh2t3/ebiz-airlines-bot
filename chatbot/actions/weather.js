module.exports = (bot) => ({
    getForecast({context, entities, sessionId, text})
    {
        return new Promise(function (resolve, reject) {
            if(entities.intent != null || context.missingLocation != null) {
                console.log(sessionId + ' ' + text);
                const location = (entities.location) ? entities.location[0].value : null;
                if (location) {
                    context.forecast = 'sunny in ' + location; // we should call a weather API here
                    context.done = true;
                    delete context.missingLocation;
                } else {
                    context.missingLocation = true;
                    delete context.forecast;
                }
                return resolve(context);
            } else{
                reject(context);
            }
        });
    }
});