var express = require('express');
var app = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

var Listing = require('../controllers/listing_cont');

	// login apis
	

	app.get('/all', Listing.all_listing);
	app.get('/latest', Listing.latest_listing);


	app.post('/upload_photos', util.uploadItemImage)
	app.post('/remove-unused-files', Listing.unusedFiles)

	app.post('/create-item', util.isLoggedIn, Listing.createListing)



module.exports = app;