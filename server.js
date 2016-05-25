
var express = require('express');
var bodyParser = require('body-parser'); // for reading POSTed form data into `req.body`
var session = require('express-session');
var app = express();

var mongojs = require('mongojs');
var db = mongojs('local',['linkedin']);
var https = require('https');
var http = require('http');
var LP = require('linkedin-public-profile-parser');

// create session - no need
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());


//get linkedin public profile
app.get('/linkedin_public_profile',function(req,res){
	var url = req.query.url;
	LP(url, function(err, data){
	  res.json(data);
	})
});

//get_users_by_skill
app.get('/get_users_by_skill',function(req,res){
 
 var skill = req.query.skill;
 
 	db.linkedin.find({skills :{$regex: skill,$options:'i'}}, function (err, profiles) {
		if (err) {
			res.jsonp({success:false, message: err});
		}
		else{
			res.jsonp({success:true,profile:profiles});
		}
	});
});

//get_profile_user_by_name
app.get('/get_profile_user_by_name',function(req,res){
 
 var name = req.query.name;
	console.log(name);
 	db.linkedin.find({fullname :{$regex: name,$options:'i'}}, function (err, profile) {
		if (err) {
			res.jsonp({success:false, message: err});
		}
		else{
			res.jsonp({success:true,profile:profile});
		}
	});
});

//add profile to DB
app.post('/add_profile_toDb',function(req,res){
	
	var body = req.body;
	db.linkedin.insert(body, function(err) {

		if (err) {
			res.jsonp({
				success : false,
				message : err
			});
		} else {
			
			res.jsonp({
				success : true
			});
		}

	});
	
});



app.listen(8080);
console.log('Example app listening on port 80!');


