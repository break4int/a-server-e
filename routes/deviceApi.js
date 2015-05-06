define(['app', 'color-util-logs', 'async', 'moment', 'node-uuid'], 
		function(app, log, async, moment, uuid){
	
	app.get('/device/fingerprint', function(req, res){
		fingerprint(req, res);
	});

	var fingerprint = function(req, res){
		res.writeHead(200, {'Content-Type':'application/json;charset=UTF-8'});
		
		var deviceSql = 'INSERT INTO device (user_id, fingerprint, reg_date, upd_date) VALUES (?, ?, NOW(), NOW())';
		var userSql = 'INSERT INTO USER (user_email	, password, user_name	, phone_number, reg_date, upd_date)'+
							' VALUES (NULL, NULL, NULL, NULL, NOW()	, NOW())' ;

		req.dbPool.getConnection(function(err, conn) {
			async.waterfall([
				function(callback){
					conn.query(userSql, function (err, rows) {
						if(err) {
							 conn.release();
							 throw err;
						 }
						 callback(null, rows.insertId);
					});
				},
				function(userId, callback){
					var fingerprint = uuid.v4() + moment().format('YYYYMMDD');
					conn.query(deviceSql, [userId, fingerprint], function (err, rows) {
						 if(err) {
							 conn.release();
							 throw err;
						 }
						 callback(null, fingerprint);
						 conn.release();
					});
				}
			],
			function(err, result){
				 if(err) {
					 conn.release();
					 throw err;
				 }
				 var resultSet = {
					code : 'A_0000',
					message : 'OK',
					result : result
				 };
				res.end(JSON.stringify(resultSet));
			});
		});
	};
});


