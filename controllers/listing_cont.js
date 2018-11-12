var Users = require('../models/users');
var jwt = require('jsonwebtoken');
var shortid = require('shortid');
var bcrypt = require('bcrypt-nodejs');
var Listing = require(__base+'models/listings');
var fs = require('fs');
var async = require('async');


const controllers = {
	

	all_listing: (req, res, next) => {
	var options = {}, query = {};
		if(req.query.latest==='true'){
			options.sort = {date_created: -1};
			options.limit = 21;
		}
		Listing.paginate(query, options).then(function(result) {
			return res.status(200).send({
				success: true,
				message: 'listings fetched Successfully',
				result: result.docs
			});
		}).catch(error=>{
			return res.status(200).send({
				success: false,
				message: error,
			});
		});
	},

	all_my_listings:(req, res, next)=>{
		var query = {agent: req.decoded.Id, category: req.query.category};
		var options = {page: req.query.page, limit: 6, sort: {date_created: -1}};
		Listing.paginate(query, options).then(function(result) {
			return res.status(200).send({
				success: true,
				message: 'My listings fetched Successfully',
				result: result
			});
		}).catch(error=>{
			return res.status(200).send({
				success: false,
				message: error,
			});
		});
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
		Listing.paginate({}, { sort: {date_created: -1}, limit: 9 }).then(function(result) {
			return res.status(200).send({
				success: true,
				message: 'listings fetched Successfully',
				result: result.docs
			});
		}).catch(error=>{
			return res.status(200).send({
				success: false,
				message: error,
			});
		});
	},



}


module.exports = controllers;