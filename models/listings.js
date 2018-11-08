
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var listings = new Schema({
	Id: {type:String, required: true},
	enabled: {
	    type: Boolean,
	    default: true
	},
	

});


module.exports = mongoose.model('listings', listings);
