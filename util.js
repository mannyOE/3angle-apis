var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var tor = "We Love Triangoolate V_1.0.0";
app.use(bodyParser.json());
var jwt = require('jsonwebtoken');
var Request = require('request-promise');
var shortid = require('shortid');
var User = require(__base+'models/users');





module.exports = {
  isLoggedIn: (req, res, next) => {
    var token = req.headers['token'] || req.body.token || req.params.token;
    console.log(token);
    if (token) {
      jwt.verify(token, tor, function (err, decoded) {
        if (err) {
          return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
        } else {

          req.decoded = decoded;
          User.findOne({Id:req.decoded.Id}, function (err, user) {
            if (!user) {
              return res.status(403).send({
                success: false,
                message: 'User does not exist.'
              });
            }
            req.decoded.user = user;
            
            next();


          })
          // check if account is Blocked
        }
      });
    } else {

      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });

    }
  },
  
  profile_complete: (req, res, next) => {
    var id = req.decoded.id;
    User.findById(id, function (err, apprmanager) {
      if (err || !apprmanager) {
        res.status(400).send({
          success: false,
          message: 'This User does not exist',
        })
        return;
      }
      if (apprmanager.profile_status) {
        next()
      } else {
        res.status(200).send({
          success: false,
          message: 'Profile Incomplete. Complete Profile to be able to post ads',
        });
        return;
      }
    });
  },
  upload: function (req, res, next) {
    if (!req.files) {
      console.log('no file for upload');
      return next();
    }

    console.log();
    var image = req.files.photo;
    if (!fs.existsSync("./public/contents/profile")) {
      fs.mkdir("./public/contents/profile", function (err) {
        if (err) {
          return console.log('failed to write directory', err);
        }
      });
    }

    if (!req.files.photo) {
      console.log('no photo');
      if (req.method == "POST") {
        res.json({
          success: false,
          message: 'profile photo upload Required',
        });
        return;
      }
      if (req.method == "PUT") {
        return next();
      }
    }
    // next()
    var x = image.name.split(".");
    var ext = x[x.length - 1];
    var file = new Date().getTime() + "." + ext;
    var rename = './public/contents/profile/' + file;
    image.mv(rename, function (err) {
      req.body.image = 'contents/profile/' + file;
      console.log('upload complete')

      User.findById(req.params.id, function (err, apprmanager) {
        if (err || apprmanager === null) {
          next()
        } else {
          if (fs.existsSync("./public/" + apprmanager.image)) {
            fs.unlink("./public/" + apprmanager.image, function (err) {
              if (err) {
                return console.log('failed to write directory', err);
              }
            });
          }
          return next();
        }
      });
    });
  },


  uploadItemImage:function(request, response, next){
    var image = request.files.file;
         if (!fs.existsSync("./public/contents/listings")) {
            fs.mkdir("./public/contents/listings", function (err) {
                if (err) {
                    return console.log('failed to write directory', err);
                }
            });
          }
         // console.log(image)
         var x = image.name.split(".");
         var ext = x[x.length - 1];
         var id = shortid.generate();
         var file = new Date().getTime() + "-" + id + "." + ext;
         var rename = './public/contents/listings/' + file;
         image.mv(rename, function (errFile) {
          console.log(errFile)
            if(!errFile){
              response.json({
                upload: {
                  image: 'contents/listings/'+file,
                  center: false,
                }
              })
            }
         });
  },


  uploadProfile:function(request, response, next){
    var image = request.files.file;
    var old = request.headers['old'];
    console.log(old);
         if (!fs.existsSync("./public/contents/profiles")) {
            fs.mkdir("./public/contents/profiles", function (err) {
                if (err) {
                    return console.log('failed to write directory', err);
                }
            });
          }
          if(old!==undefined){
            if(fs.existsSync("./public/"+old)){
                fs.unlink("./public/"+old, function(error) {
                    if (error) {
                        throw error;
                    }
                });
            }
        }
         // console.log(image)
         var x = image.name.split(".");
         var ext = x[x.length - 1];
         var id = shortid.generate();
         var file = new Date().getTime() + "-" + id + "." + ext;
         var rename = './public/contents/profiles/' + file;
         image.mv(rename, function (errFile) {
          console.log(errFile)
          User.findById(request.decoded._id, function (err, user) {
            if (err || user === null) {
              next()
            } else {
              request.uploaded = {
                file: file,
                image: 'contents/profiles/'+file,
                id: id
              };
              delete request.body;
              request.body = user;
              request.body.image = 'contents/profiles/'+file;
              console.log('upload complete', request.body)
              next(); 
            }
          });
         });
  },

  secret: tor,
  Email: function (data) {
    console.log('got to email 2')
    const sendmail = require('sendmail')();
    data['site_url'] = "http://triangoolate.com";
    if (!data.template) {
      sendmail({
        from: 'Triangoolate <notifications@triangoolate.com>',
        to: data.email || data.Email,
        subject: data.subject,
        html: data.contents,
      }, function (err, reply) {
        if (!err) {
          console.log("Mail sent to " + data.email);
        } else {
          console.log("Error sending mail to " + data.email, err);
        }
      });
      return;
    }
    console.log('using template');
    var fs = require('fs');
    fs.readFile(__base + 'views/templates/' + data.template + '.hbs', 'utf8', function (err, contents) {

      if (err) {
        console.log('err', err)
        return;
      }

      for (var i in data) {
        var x = "{{" + i + "}}";
        while (contents.indexOf(x) > -1) {
          contents = contents.replace(x, data[i]);
        };
      }

      sendmail({
        from: 'Triangoolate <notifications@triangoolate.com>',
        to: data.email || data.Email,
        subject: data.subject,
        html: contents,
      }, function (err, reply) {
        if (!err) {
          console.log("Mail sent to " + data.email, data.link)
        } else {
          console.log("Error sending mail to " + data.email, err);
        }
        // console.dir(reply);
      });

    });

    return;

    var options = {
      auth: {
        //api_user: 'natterbase',
        //api_key: 'Na20ter70'
        //                  user : 'zeedas',
        api_key: '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'

      }
    }

    var sgTransport = require('nodemailer-sendgrid-transport');

    var transporter = nodemailer.createTransport(sgTransport(options));


    //transporter.use('compile', hbs(options));
    var mailOptions = {
      from: 'Crevance <notifications@crevance.loans>',
      to: data.email,
      subject: data.subject,
      text: data.template,
      html: data.template,
      context: data
    };


    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("ERROR: " + error);
      } else {
        // console.log('Message sent: ' + info.response);
      }
    });

  },
  badRequest: (req, res, next) => {
    res.status(200).json(req.responseBody);
  },
  goodRequest: (req, res, next) => {
    res.status(200).json(req.responseBody);
  },
  send_sms: (body) => {
    const options = {
      method: 'GET',
      uri: 'http://www.quicksms1.com/api/sendsms.php?username=' + sms_auth.username +
      '&password=' + sms_auth.password + '&sender=Fundall&message=' + body.message + '&recipient=' +
      body.phone + '&report=1&convert=1&route=1',
    };
    // console.log(sms_auth.username);
    // console.log(body.phone);
    // console.log(options);
    Request(options)
      .then((response) => {
        // save details to db
        console.log('Response:', response);
        return;
      })
      .catch((error) => {
        console.log('error:', error);
        return;
      })
  },
  check_email: (email) => {
    var t = email.split('@', 5);
    if (t.length === 2) {
      var f = t[1].split('.', 5);
      if (f.length !== 2) {
        return false;
      }
      return true;
    } else {
      return false;
    }
  },
  check_dob: (dob) => {
    var t = dob.split('-', 5);
    if (t.length === 3) {
      if (Number(t[0]) !== 0 && Number(t[1]) !== 0 && Number(t[2]) !== 0) {
        return true;
      }
      return false
    } else {
      return false;
    }
  },
  

}