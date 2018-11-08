var Users = require('../models/users');
var jwt = require('jsonwebtoken');
var shortid = require('shortid');
var bcrypt = require('bcrypt-nodejs');
var Listing = require(__base+'models/listings');


const controllers = {
	

	all_listing: (req, res, next) => {
		Listing.find({}, (error, listings)=>{
			if(error){
				req.responseBody = {
					success: false,
					message: 'Failed to fetch listings',
				}
				util.badRequest(req, res, next);
				return;
			}else{
				return res.status(200).send({
					success: true,
					message: 'listings fetched Successfully',
					result: listings
				});
			}
		})
	},

	latest_listing: (req, res, next) => {
		Listing.find({}, (error, listings)=>{
			if(error){
				req.responseBody = {
					success: false,
					message: 'Failed to fetch listings',
				}
				util.badRequest(req, res, next);
				return;
			}else{
				return res.status(200).send({
					success: true,
					message: 'listings fetched Successfully',
					result: listings
				});
			}
		})
	},



}


module.exports = controllers;