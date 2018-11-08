
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var users = new Schema({
	Id: {type:String, required: true},
	firstName: String,
	lastName: String,
	email: {
		type: String,
		unique: true,
		required: true
	},
	phone: {
		unique: true,
		type: String
	},
	isVerified: {
	    type: Boolean,
	    default: false
	},
	verificationToken: {
	    type: String,
	},
	image: {
	    type: String
	},
	enabled: {
	    type: Boolean,
	    default: false
	},
	password: {
	    type: String,
	    required: [true, 'Password is required'],
	    minLength: 4
	},
	title: {type: String},
	company: String,

});


module.exports = mongoose.model('users', users);
