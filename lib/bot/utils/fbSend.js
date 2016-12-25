'use strict';
const config = require('config');

module.exports = (id, text) => {
    if(text == "null")
        return;
    const body = JSON.stringify({
        recipient: { id },
        message: { text },
    });
    const fbPageToken = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ? process.env.MESSENGER_PAGE_ACCESS_TOKEN : config.get('pageAccessToken');
    const qs = 'access_token=' + encodeURIComponent(fbPageToken);
    return fetch('https://graph.facebook.com/v2.6/me/messages?' + qs, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body,
    })
        .then(rsp => rsp.json())
        .then(json => {
            if (json.error && json.error.message) {
                throw new Error(json.error.message);
            }
            return json;
        });
};