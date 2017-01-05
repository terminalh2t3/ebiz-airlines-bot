module.exports = (bot) => {
    bot.on('attachment', (payload, chat) => {
        //Handle location
        console.log(payload);
        const attachment = payload.message.attachments[0];
        if(attachment.type == 'location'){
            const lat = attachment.payload.coordinates.lat;
            const long = attachment.payload.coordinates.long;
            chat.runWit('My current location are ' + lat + ' and ' + long);
            return true;
        } else{
            return false;
        }
    });
}