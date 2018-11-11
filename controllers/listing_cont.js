var Users = require('../models/users');
var jwt = require('jsonwebtoken');
var shortid = require('shortid');
var bcrypt = require('bcrypt-nodejs');
var Listing = require(__base+'models/listings');
var fs = require('fs');
var async = require('async');


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


	unusedFiles: (req, res, next)=>{
		async.each(req.body.images, (img, cb)=>{

			if(fs.existsSync("./public/"+img.image)){
                fs.unlink("./public/"+img.image, function(error) {
                    if (error) {
                        throw error;
					}
					cb();
				});
			}else{
				cb();
			}
		}, (error2)=>{
			res.json({
				status: true,
				message: "delete completed"
			})
		})
	},
	createListing: (req, res, next)=>{
		
		req.body.date_created = new Date().getTime();
		req.body.Id = new Date().getTime();

		var ls = new Listing(req.body);
		ls.save(error=>{
			if (error) {
				req.responseBody = {
					success: false,
			        message: 'item Already Exists',
			        err: error
				}
				util.badRequest(req, res, next);
				return;
			}

			return res.json({
				success: true,
				message: 'Your Item just went online'
			});
		})
	},
	latest_listing: (req, res, next) => {
		Listing.paginate({}, {sort: '-date_created'}).then((error, listings)=>{
			if(!error){
				return res.status(200).send({
					success: true,
					message: 'listings fetched Successfully',
					result: listings
				});
			}else{
				return res.status(200).send({
					success: false,
					message: error,
				});
			}
		});
	},



}


module.exports = controllers;