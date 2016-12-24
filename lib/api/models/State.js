'use strict';
const bookshelf = require('../database/connect-database');
const ModelBase = require('bookshelf-modelbase')(bookshelf);
const Country = require('./State');
const ContactDetail = require('./ContactDetail');
const State = ModelBase.extend({
    tableName: 'public.State',
    hasTimestamps: false,
    country: function() {
        return this.belongsTo(Country);
    },
    contactDetail: function () {
        return this.hasMany(ContactDetail);
    }
}, {
    findState: function (stateName) {
        return this.forge().query({where:{ state_name: stateName }}).fetch();
    }
});

module.exports = State;