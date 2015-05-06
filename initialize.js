var requirejs = require('requirejs');

requirejs.config({
	baseUrl : './routes',
	paths : {
		'app' : '../app',
		'deviceApi' : 'deviceApi',
		'partnerApi' : 'partnerApi',
		'ticketApi' : 'ticketApi',
		'userApi' : 'userApi',
		'interceptor' : '../js/interceptor'
	},
	nodeRequire : require
});

requirejs(['app', 'deviceApi', 'partnerApi', 'ticketApi', 'userApi', 'interceptor'], function(app){
	app.listen(3000, function(){
		console.log('Express server start');
	});
});