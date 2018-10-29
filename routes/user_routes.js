var express = require('express');
var app = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

var User = require('../controllers/user_cont');

	// login apis
	app.post('/login', User.login);
	app.post('/register', User.register);
	app.post('/resend_confirmation', User.resend_confirmation);

	app.post('/recover_password', User.recover_password);
	app.post('/new_password', User.change_password);

	app.get('/confirm_email/:tken', User.confirm_account);





module.exports = app;