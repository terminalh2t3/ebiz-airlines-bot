'use strict';
const BaseModel = require('./BaseModel');

class ContactDetail extends BaseModel
{
    get tableName() {
        return 'ContactDetail';
    }

    get hasTimestamps() {
        return false;
    }
}
module.exports = ContactDetail;