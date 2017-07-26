var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var stylus = require('stylus');
var route = require('./routes/route');
var dbmodule = require('./public/javascripts/dbmodule.js');
var helmet = require('helmet');
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(helmet());
app.use(cookieParser());
// Serving static files on Express Server 
   app.use(stylus.middleware(
                     {
                    src: __dirname + '/public',
                    dest: __dirname + '/public'
                    }));
app.use(express.static(__dirname + '/public'));

// Serving Favicon Icon
app.use(favicon(path.join(__dirname, 'public', 'express_favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
// Using body-parser to handle post requests throughout the app 
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

app.use('/', route);

// catch 404 and forward to error handler
app.all('*', function(req, res, next) {
  var err = new Error();
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
	 res.render('error', {message : 'Sorry, the page you requested for does not exist', linked : 'http://localhost:1010/'});
});


// Using sessions in the app 

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true,
	cookie:{maxAge:120000}
}));

// Establishing connection to server 
app.listen(1010);
console.log("Server has begun on port 1010");

/* 
 app.get('/', function(req, res) {
    console.log("Request For E-wallet Received");
	res.render('newHome', { title: 'ExpressWallet'});
}); 


app.get('/loginPage', function(req, res) {
    console.log("Request For E-wallet Login Received");
	res.render('index', { title: 'Login to ExpressWallet' });
});
 
 // Handling request for logging in User to Express wallet after checking valid credentials.

app.post('/login', function(req, res) {
	var username = req.body.username;
    var pass = req.body.pass;
	req.session.username = username;
	console.log("Your session starts now"+req.session.username);
	dbmodule.authenticateUser(username, pass,res);
});

// Routing for Logout Tab 

app.get('/user/:username/logout',function(req,res){
		req.session.destroy(function(){
		console.log("Logging out"+req.params.username);
		res.redirect('/');
	});
	
});  */



module.exports = app;
