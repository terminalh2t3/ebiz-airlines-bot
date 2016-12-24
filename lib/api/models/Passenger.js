'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const ContactDetail = require('./ContactDetail');
const Passenger = ModelBase.extend({
    tableName: 'public.Passenger',
    contactDetail: function () {
        return this.belongsTo(ContactDetail)
    }
});

module.exports = Passenger;