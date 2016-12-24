'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);

const ContactDetail = ModelBase.extend({
    tableName: 'public.ContactDetail',
});

module.exports = ContactDetail;