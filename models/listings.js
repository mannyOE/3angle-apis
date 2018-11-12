
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');


var listings = new Schema({
	Id: {type:String, required: true},
	enabled: {
	    type: Boolean,
	    default: true
	},
	featured: {
	    type: Boolean,
	    default: false
	},
	images: [],
	title: String,
	agent: String,
	agentName: String,
	state: String,
	location: String,
	category: String,
	appartmentType: String,
	cost: String,
	description: String,
	latitude: String,
	longitude: String,
	views: {
		type: Number,
		default: 0
	},
	requests: {
		type: Number,
		default: 0
	},
	date_created: Number,



});
listings.plugin(mongoosePaginate);

module.exports = mongoose.model('listings', listings);
