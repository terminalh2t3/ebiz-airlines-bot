'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const State = require('./State');
const Passenger = require('./Passenger');
const ContactDetail = ModelBase.extend({
    tableName: 'public.ContactDetail',
    state: function () {
        return this.belongsTo('State')
    },
    passenger: function () {
        return this.hasMany('Passenger')
    }
});

module.exports = bookshelf.model('ContactDetail',ContactDetail);