var express = require('express');
var app = express();
var cors         = require('cors');
global.__base = __dirname + '/';
var fs = require('fs');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const morgan = require('morgan');
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
app.use(morgan('dev'));
var fileUpload = require('express-fileupload');
var handlebars   = require('express3-handlebars');
app.set('port', process.env.PORT || 2300);

global.hostname   = process.env.HOSTNAME || "localhost";
hostname = global.hostname.toLowerCase();
global.hostport   = app.get('port');
global.hosturl    = "http://"+hostname+":"+hostport;
global.mail_url = "http://"+hostname;
global.util = require('./util');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static('public'));

// load routes files here
var users = require('./routes/user_routes');
var Listings = require('./routes/listing_routes');




// set routes here
app.use('/api/users', users);

app.use('/api/listings', Listings);


app.engine('html', handlebars({defaultLayout: 'main', extname: ".html",layoutsDir: __dirname + '/view/main'}));

app.set('view engine', 'html');

app.set('views', __dirname + '/views');



var connection = mongoose.connect('mongodb://localhost/triangoolate', function(err) {
    if (err) {
        console.log('database connection error', err);
    } else {
        console.log('database connection successful');
        app.listen(2300, function(){
            console.log('Running on Port 2300');
        });
    }
});

// User management routes
