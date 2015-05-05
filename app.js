var express = require('express')
  , http = require('http')
  , path = require('path')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , config = require('./config')()
  , mysql = require('mysql')
  , errorhandler = require('errorhandler')
  , morgan = require('morgan')
  , interceptor = require('./js/interceptor')()
  , async = require('async')
  , partnerApi = require('./routes/partnerApi')
  , userApi = require('./routes/userApi')
  , ticketApi = require('./routes/ticketApi')
  , deviceApi = require('./routes/deviceApi');

log = require('color-util-logs');
moment = require('moment');

var app = express();
app.set('port', 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan(':date[iso]-:method :url :status -:response-time ms'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.session({secret:'keyboard cat', cookie:{maxAge:new Date(Date.now()+60*1000)}}));
app.use(app.router);


if ('dev' === config.mode) {
    app.use(errorhandler());
}
app.use(function(req, res, next){
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});
if ('prd' === config.mode) {
	app.use(function(err, req, res, next){
		var resultSet = {
								resultCode : err.status,
								message : err.message
							};
		res.end(JSON.stringify(resultSet));
	});
}
app.use(function(err, req, res, next){
	res.render('error.ejs', { err: err, status: err.status });   
});


//http.createServer(app).listen(config.port, function(){
http.createServer(app).listen(config.port, function(){
	console.log('Express server mode ' + config.mode);
	console.log('Express server port ' + config.port);
});

var dbPool = mysql.createPool({
	host : process.argv[2],
	port : 3306,
	user : process.argv[3],
	password : process.argv[4],
	database : 'americano',
	connectionLimit : 10, 
	waitForconnections : true
});

app.all('*', function(req, res, next){
	res.set('X-Server-Type', 'Express');
	req.dbPool = dbPool;
	interceptor.login(req, res);
	next();
});

app.get('/device/fingerprint', deviceApi.fingerprint);
app.get('/partner', partnerApi.partner);
app.get('/partner/:partnerId', partnerApi.partner);
app.get('/user/:userId/ticket', userApi.ticket); 
app.get('/ticket/:ticketId', ticketApi.ticket);
app.put('/ticket/:ticketId/use', ticketApi.ticketUse);
app.put('/ticket/:ticketId/cancel', ticketApi.ticketCancel);
