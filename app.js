define(['express', 'color-util-logs', 'morgan','body-parser', 'cookie-parser', 'mysql', 'errorhandler', 'interceptor'], 
		function(express, log, morgan, bodyParser, cookieParser, mysql, errorhandler, interceptor){
	var app = express();
	app.set('port', 3000);
	app.use(morgan(':date[iso]-:method :url :status -:response-time ms'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(express.session({secret:'keyboard cat', cookie:{maxAge:new Date(Date.now()+60*1000)}}));
	app.use(app.router);

	app.use(function(req, res, next){
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});
	/*if ('prd' === config.mode) {
		app.use(function(err, req, res, next){
			var resultSet = {
									resultCode : err.status,
									message : err.message
								};
			res.end(JSON.stringify(resultSet));
		});
	}*/
	app.use(function(err, req, res, next){
		res.render('error.ejs', { err: err, status: err.status });   
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
	
	return app;
});