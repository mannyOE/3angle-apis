var Users = require('../models/users');
var jwt = require('jsonwebtoken');
var shortid = require('shortid');
var bcrypt = require('bcrypt-nodejs');
var User = require(__base+'models/users');


const controllers = {
	login : (req, res, next)=>{
		console.log('logi');
		if (Number(req.body.email) === 0 || req.body.email === undefined || !util.check_email(req.body.email)) {
			req.responseBody = {
				success: false,

				message: 'A Valid email address must be provided to login',
			}
			util.badRequest(req, res, next);
			return;
		}
		if (Number(req.body.password) === 0 || req.body.password === undefined) {
			req.responseBody = {
				success: false,

				message: 'Please provide a password to login',
			}
			util.badRequest(req, res, next);
			return;
		}
		User.findOne({ email: req.body.email }, function (err, user) {

			if (err) {
				req.responseBody = {
					success: false,
					message: 'User not found',
				}
				util.badRequest(req, res, next);
				return;
			}
		    if (user === null) {
				req.responseBody = {
					success: false,
					message: 'Email or password incorrect'
				}
				util.badRequest(req, res, next);
				return;
		    } else {
				if (user !== null) {
					if (!user.isVerified) {
						req.responseBody = {
							success: false,
							message: 'This account has not been verified'
						}
						util.badRequest(req, res, next);
						return;
					}
					bcrypt.compare(req.body.password, user.password, function (err, crypt) {
						if (crypt != true) {
							req.responseBody = {
								success: false,
								message: 'Password incorrect'
							}
							util.badRequest(req, res, next);
							return;
						} else {
							var payload = {
								_id: user._id,
								Id: user.Id
							}
							delete user.password;
							var token = jwt.sign(payload, util.secret);
							return res.status(200).send({
								success: true,
								message: 'User Logged In Successfully',
								result: {
									user: user,
									token: token,
									enabled: user.enabled
								}
							});
						}
					})
				}
		    }

		});
	},
	register : (req, res, next)=>{
		console.log(req.body);
		if (req.body.firstName === undefined || req.body.firstName.length < 1) {
			req.responseBody = {
				success: false,
				message: 'Please provide a valid first name to continue',
			}
			util.badRequest(req, res, next);
			return;
		}
		if (req.body.lastName === undefined || req.body.lastName.length < 1) {
			req.responseBody = {
				success: false,
				message: 'Please provide a valid last name to continue',
			}
			util.badRequest(req, res, next);
			return;
		}
		if (req.body.email === undefined || !util.check_email(req.body.email)) {
			req.responseBody = {
				success: false,
				message: 'Please provide a valid email address to continue',
			}
			util.badRequest(req, res, next);
			return;
		}
		if (req.body.password === undefined || req.body.password.length < 5) {
			req.responseBody = {
				success: false,
				message: 'Please provide a password longer than 5 characters to continue',
			}
			util.badRequest(req, res, next);
			return;
		}

		if (req.body.phone === undefined || req.body.phone.length < 8) {
	    	console.log('signup');
			req.responseBody = {
				success: false,
				message: 'Please provide a valid phone number to continue',
			}
			util.badRequest(req, res, next);
			return;
		}

		var token = bcrypt.hashSync(shortid.generate()).replace(/[^\w]/g, "");
		var user = new User({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email.toLowerCase(),
			phone: req.body.phone,
			password: bcrypt.hashSync(req.body.password),
			Id: shortid.generate(),
			verificationToken: token,
		}
		);
		user.save(function (err) {
			if (err) {
				req.responseBody = {
					success: false,
			        message: 'User Already Exists',
			        err: err
				}
				util.badRequest(req, res, next);
				return;
			}
			var token_url = mail_url + '/verify-user/' + token;
			// send verification email here
				// var body = {
				// 	message: "Please click this link to verify your account. \n" + token_url,
				// 	phone: req.body.phone
				// }
				// util.send_sms(body);
				var dataz = {
					email: req.body.email,
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					template: 'email_confirm',
					subject: "New Account Verification",
					url: token_url
				}
				util.Email(dataz);
			

			return res.json({
				success: true,
				message: 'A Verification Email Has Been Sent to You'
			});
		});
	},

	updateUser: (req, res, next) => {
		if (req.body.password) {
			req.body.password = bcrypt.hashSync(req.body.password);
		}
		if((req.body.image !== undefined)&&(req.body.title!==undefined)&&(req.body.company!==undefined)){
			req.body.enabled = true;
		}
		User.findByIdAndUpdate(req.decoded._id, { $set: req.body }, function (err, uder) {
		    if (err) {
				req.responseBody = {
					success: false,
					message: 'User not found',
					err: err,
				}
				util.badRequest(req, res, next);
				return;
		    }
		    User.findById(req.decoded._id, function (err, apprmanager) {
				res.json({
					success: true,
					message: 'User has been succesfully updated.',
					result: (apprmanager)
				})
				return;
			});

		});
	},

	resend_confirmation: (req, res, next) => {
		// send verification email here
		if (req.body.email) {
	    	User.findOne({ email: req.body.email }, (err, rsendUser) => {
				if (rsendUser) {
					var token_url = mail_url + '/verify-user/' + rsendUser.verificationToken;
					// send verification email here
					
						// var body = {
						// 	message: "Please click this link to verify your account. \n" + token_url,
						// 	phone: rsendUser.phone
						// }
						// util.send_sms(body);
						var dataz = {
							email: req.body.email,
							firstName: req.body.firstName,
							lastName: req.body.lastName,
							template: 'email_confirm',
							subject: "New Account Verification",
							url: token_url
						}
						util.Email(dataz);
					req.responseBody = {
						success: true,
				        message: 'Confirmation Resent',
					}
					util.goodRequest(req, res, next);
					return;
				} else {
					req.responseBody = {
						success: false,
				        message: 'User Does not exist',
					}
					util.badRequest(req, res, next);
					return;
				}
	    	})
		} else {
	    	req.responseBody = {
				success: false,
				message: 'User Email Required',
			}
			util.badRequest(req, res, next);
			return;
		}

	},
	recover_password: (req, res, next) => {
		// send verification email here
		if (req.body.email) {
			var token = bcrypt.hashSync(shortid.generate()).replace(/[^\w]/g, "");
	    	User.findOne({ email: req.body.email }, (err, rsendUser) => {
				if (rsendUser) {
					var token_url = mail_url + '/change-password/' + token;
					rsendUser.verificationToken = token;
					// send verification email here
					
						// var body = {
						// 	message: "Please click this link to verify your account. \n" + token_url,
						// 	phone: rsendUser.phone
						// }
						// util.send_sms(body);
						var dataz = {
							email: req.body.email,
							firstName: req.body.firstName,
							lastName: req.body.lastName,
							template: 'reset_email',
							subject: "Password Recovery Request",
							url: token_url
						}
						util.Email(dataz);
						rsendUser.save();
					req.responseBody = {
						success: true,
				        message: 'Recovery Token Sent',
					}
					util.goodRequest(req, res, next);
					return;
				} else {
					req.responseBody = {
						success: false,
				        message: 'User Does not exist',
					}
					util.badRequest(req, res, next);
					return;
				}
	    	})
		} else {
	    	req.responseBody = {
				success: false,
				message: 'User Email Required',
			}
			util.badRequest(req, res, next);
			return;
		}

	},
	confirm_account: (req, res, next) => {
		var tken = req.params.tken;
		User.findOne({ verificationToken: tken }, (err, uder) => {
			if (err) {
				req.responseBody = {
					success: false,
					message: 'User not found',
				}
				util.badRequest(req, res, next);
				return;
			}
			if (!uder) {
				return res.send({
					success: false,
					message: 'This Account Was Not Found'
				});
			} else {
				uder.verificationToken = "";
				uder.isVerified = true;
				uder.save();
				return res.send({
					success: true,
					message: 'Account Has Been Verified'
				});
			}
		})
	},

	change_password: (req, res, next) => {
		var tken = req.body.token;
		console.log(req.body.password);
		User.findOne({ verificationToken: tken }, (err, uder) => {
			if (err) {
				req.responseBody = {
					success: false,
					message: 'Token not found',
				}
				util.badRequest(req, res, next);
				return;
			}
			if (!uder) {
				return res.send({
					success: false,
					message: 'This Account Was Not Found'
				});
			} else {
				uder.verificationToken = "";
				uder.password = bcrypt.hashSync(req.body.password);
				uder.save();
				return res.send({
					success: true,
					message: 'Password Changed'
				});
			}
		})
	},


	new_password: (req, res, next) => {
		var user = req.decoded.user.email;
		User.findOne({ email: user }, (err, uder) => {
			if (err) {
				req.responseBody = {
					success: false,
					message: 'User not found',
				}
				util.badRequest(req, res, next);
				return;
			}
			if (!uder) {
				return res.send({
					success: false,
					message: 'This Account Was Not Found'
				});
			} else {
				bcrypt.compare(req.body.old, uder.password, function (err, crypt) {
						if (crypt != true) {
							req.responseBody = {
								success: false,
								message: 'Old Password incorrect',
							}
							util.badRequest(req, res, next);
							return;
						} else {
							console.log(req.body.new);
							uder.password = bcrypt.hashSync(req.body.new);
							uder.save();
							return res.send({
								success: true,
								message: 'Password Changed'
							});							
						}
					})
				
			}
		})
	},



}


module.exports = controllers;