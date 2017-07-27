var express = require('express');
var router = express.Router();
var dbmodule = require('../public/javascripts/dbmodule.js');
var path = require('path');
var session = require('express-session');

//Global variables on the server
var userName; 
var firstName; 
var lastName;
var acBalance; 
var contact ; 
var dob ; 
var address ; 
var errormessage;



//Exporting Data From Server to dbModule
exports.names = function(data){
	console.log("data is :");
	console.log(data);
	contact = data[0].contact;
	dob = data[0].dob;
	address = data[0].address;
	firstName 	= data[0].firstname;
	lastName  	= data[0].lastName;
	userName  	= data[0].username;
	acBalance  	= data[0].balance;
}


// Routing for logging in User to Express wallet

  router.get('/', function(req, res) {
    console.log("Request For E-wallet Received");
	res.render('newHome', { title: 'ExpressWallet'});
}); 


router.get('/loginPage', function(req, res) {
    console.log("Request For E-wallet Login Received");
	res.render('index', { title: 'Login to ExpressWallet' });
}); 

// Handling request for logging in User to Express wallet after checking valid credentials.

 router.post('/login', function(req, res) {
	var username = req.body.username;
    var pass = req.body.pass;
	//req.session.username = username;
	//console.log("Your session starts now"+req.session.username);
	dbmodule.authenticateUser(username, pass,res);
});

// Routing for saving User to Express wallet

router.get('/register', function(req, res) {
    console.log("Request For Register Received");
    res.render('signUp', { title: 'Register For ExpressWallet' });
});

// Handling request for saving User to Express wallet

router.post('/save', function(req, res) {
    console.log("Request For Save Received");
	 var username = req.body.username;
     var pass = req.body.pass;
	 var firstname = req.body.firstname;
     var lastname = req.body.lastname;
	 var contact= req.body.phoneNumber;
	 var dob= req.body.DOB;
	 var address= req.body.address;
	 console.log(req.body);
	 dbmodule.saveUser(username, pass,firstname,lastname,contact,dob,address,res);
    
});
//Routing for UserHome 

router.get('/user/:username/loginHome', function(req,res){
	var username = req.params.username;
	userName = username;
    console.log("Request For User Home By "+userName+" Received");
	res.render('LoginHome', { title: 'Welcome to Express Wallet', userName : username });
	
});

// Routing for MyProfile Tab 

router.get('/user/:username/', function(req,res){
	var username = req.params.username;
	userName = username;
    console.log("Request For Profile "+userName+" Received");
	dbmodule.retrieveUser(userName,res);
	res.render('home', { title: 'Your Profile', userName : userName , fullName : firstName + ' '+lastName, contact : contact , dob : dob , address : address, balance : acBalance });
});

//Routing for Transactions tab
router.get('/user/:username/myTransactions',function(req,res){
	res.render('myTransactions',{title:'Your Transactions in Express Wallet', userName : userName, balance : acBalance });	
});

//Routing for getting Transactions in myTransactions tab
router.get('/getMyTransactions/', function(req, res){;
	dbmodule.getTransactions(userName,acBalance,res);
});


//Routing for addMoney tab
 router.get('/user/:username/addMoney',function(req,res){
	res.render('addMoney',{title:'Add Money', userName : userName, balance : acBalance });
}); 

//Routing for sendMoney tab
 router.get('/user/:username/sendMoney',function(req,res){
	res.render('sendMoney',{title:'Send Money', userName : userName, balance : acBalance });
}); 

//Checking for the error related to less money in wallet all across the app
router.get('/errorMoney', function(req,res){
	res.render('errorMoney', { title: 'Insufficient Balance',userName : userName });
});
	
	router.route('/validCard')
	.get(function (req, res){
		console.log("Errormesage "+errormessage);
		res.send(errormessage);
	})
	.post( function(req, res) {
		console.log("Request For checking Card validity is received");
		var month = req.body.validTill;
		console.log("Card is valid till"+month);
		var yearEntered = month.split("-")[0];
		var monthEntered = month.split("-")[1];
		console.log("Month Entered By User is " +monthEntered);
		console.log("Year entered by user is" +yearEntered);
		var today = new Date();
		var currentYear = today.getFullYear();
		var currentMonth = today.getMonth()+ 1 ;
		if(yearEntered < currentYear){
			acBalance = acBalance;
			if(monthEntered < currentMonth){
			acBalance = acBalance;
			errormessage = "Card Not Valid";
			console.log(errormessage);
			res.redirect('/user/'+userName+'/addMoney');
			console.log("Invalid month and year ");
			}
			errormessage = "Card Not Valid";
			console.log("Invalid year");
			res.redirect('/user/'+userName+'/addMoney');	
		}
		else {
			errormessage = "";
			var amt = parseFloat(req.body.amount);
			console.log("Amount is "+amt);
			console.log("Type of Amount is "+typeof(amt));
			acBalance = acBalance + amt ;
			console.log("Type of AcBal is "+ typeof(acBalance));
			dbmodule.addMoney(userName,acBalance,amt,res);
			
		}
	});	

//Checking for valid User in Send Money tab

router.post( '/validUser',function (req, res, next) {
	var receiverUserName = req.body.user;
	var senderUserName = userName ;
	if(receiverUserName == senderUserName){
		res.render('error', { message: 'Sorry  '+ userName +'  you cannot send money to yourself. You can send money to other Express Wallet Users only.', linked:'javascript:history.back()' });
	}
	else{
		console.log("Usernames do not match! Congrats, you can proceed further!");
		next()
	}
}, function(req, res, next){
  var amount = parseFloat(req.body.amount);
  console.log('The Final response will be sent by the next function ...')
  var chkBal = 0;
  console.log("Rs."+ amount +"has to be sent to user");
  if( amount <= (acBalance) ){
		chkBal = 1 ;
		console.log("You should have" + (acBalance));
		console.log("In first Func of Post"+chkBal);
		next()
	}
	else {
		res.statusCode = 302;
		res.setHeader("Location", "http://localhost:1010/errorMoney");
		res.end();
	  }

  }, function (req, res) {
	var receiverUserName = req.body.user;
	var receiverAmount = parseFloat(req.body.amount); //Amount to be updated for receiver
	var senderUserName = userName ;
	var senderBalance = acBalance - receiverAmount;
	console.log("receiverAmount is now :"+receiverAmount);
	console.log("Type of receiverAmount is now :" + typeof(receiverAmount));
	
	console.log("SenderBal is now :"+senderBalance);
	console.log("Type of SenderBal is now :" + typeof(senderBalance));
	dbmodule.checkUser(senderUserName, receiverUserName, senderBalance,receiverAmount,res);  
});

//Routing for  Pay Elsewhere tab
router.get('/user/:username/payElse',function(req,res){
	res.render('payElse',{title:'Pay ElseWhere using Express Wallet', userName : userName, balance : acBalance });
});
//Routing for Movie Booking Link in Pay Elsewhere tab
router.get('/Movies',function(req,res){
	res.render('moviesUsecase',{title:'Pay ElseWhere using Express Wallet : Movies ', userName : userName, balance : acBalance });
});
//Checking for getting Movie List
router.get('/getMovieList', function(req, res){
	console.log("JSON FILE Request Received");
	//res.sendFile(path.join(__dirname+'/data/moviesNew.json'));
	console.log(req.query.id);
 	if(req.query.id=='bengaluru'){
		res.sendFile(path.join(__dirname+'/data/moviesNew.json'));
	}
	else if(req.query.id=='mumbai'){
		res.sendFile(path.join(__dirname+'/data/movies1.json'));
	} 
}) ;
//Checking for booking Movie successful or not 
router.get('/bookMovie*', function(req, res){
	var movie = req.query.movie_name ;
	var ticketCount = req.query.ticket_count;
	var amount = ticketCount * 100;
	console.log("You need to pay"+amount);
	if( amount <= (acBalance) ){
		console.log("Purchasing Movie Tickets For Rs."+amount);
		acBalance = acBalance - amount ;
		dbmodule.bookMovie(userName,movie,ticketCount,amount,acBalance,res);
	}
	else {
		   res.statusCode = 302;
		res.setHeader("Location", "http://localhost:1010/errorMoney");
		res.end();
	  }
}) ;
//Routing for GiftVoucher Link in Pay Elsewhere tab
router.get('/GiftVoucher',function(req,res){
	res.render('giftVoucher',{title:'Pay ElseWhere using Express Wallet : Gift Voucher', userName : userName, balance : acBalance });
});
//Checking for sending Gift successful or not 
router.post('/sendGift',function(req,res){
	var value = req.body.gift ;
	console.log("Request for "+value+" recieved");
	if(value == 1){
	var amount = 500 ;
		 if( amount <= (acBalance) ){
		console.log("Purchasing "+amount+" Rs. Gift Coupon");
		acBalance = acBalance - amount ;
		dbmodule.purchaseVoucher(userName,amount,acBalance,res);
	}
	else {
		   res.statusCode = 302;
		res.setHeader("Location", "http://localhost:1010/errorMoney");
		res.end();
	  }
	}
	if(value == 2){
		var amount = 2000 ;
		 if( amount <= (acBalance) ){
		console.log("Purchasing "+amount+" Rs. Gift Coupon");
		acBalance = acBalance - amount ;
		dbmodule.purchaseVoucher(userName,amount,acBalance,res);
	}
	else {
		 res.statusCode = 302;
		res.setHeader("Location", "http://localhost:1010/errorMoney");
		res.end();
	  }
		
	}
});

//Routing for Mobile Recharge Link in Pay Elsewhere tab

router.get('/Recharge',function(req,res){
	res.render('recharge',{title:'Pay ElseWhere using Express Wallet : Recharge Mobile ', userName : userName, balance : acBalance });
});

//Checking for Recharge Successful or not 

router.post('/rechargeSuccess', function (req, res) {
   var amount = parseFloat(req.body.amount);
   var mobileNumber = parseInt(req.body.phoneNumber);
  if( amount <= acBalance ){
		console.log("Recharging " + mobileNumber + " for Rs." + amount );
		acBalance = acBalance - amount ;
		dbmodule.rechargeDone(userName, amount,mobileNumber,acBalance,res);
	}
	else {
		  res.statusCode = 302;
		res.setHeader("Location", "http://localhost:1010/errorMoney");
		res.end();
	  }

});
// Routing for Logout Tab 

 router.get('/user/:username/logout',function(req,res){
		console.log("Logging out"+req.params.username);
		res.redirect('/');
});

module.exports = router;