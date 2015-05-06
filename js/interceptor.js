
define(['color-util-logs', 'async', 'morgan'], 
		function(log, async, morgan){

	return {
		login : function(req, res) {
			loginInterceptor(req, res);
		},
		test : function() {
			
		}
	}

	function loginInterceptor(req, res){
		var authType = req.get('x-auth-type');
		var authToken = req.get('x-auth-token');

		log.notice("authType : "+authType + ", authToken : "+authToken);
		
		if(req.path === '/device/fingerprint'){
			return true;
		}
		
		if(authType === 'fingerprint'){
			if(authToken){ // 미가입자 가입처리
				req.dbPool.getConnection(function(err, conn) {
					async.waterfall([
		     			function(callback){
		    					var sql = 'SELECT user_id AS userId FROM device WHERE fingerprint=? LIMIT 1';
		    					conn.query(sql, [authToken], function (err, rows) {
		    						if(err) {
		    							 conn.release();
		    							 throw err;
		    						 }
		    						 callback(null, rows[0].userId);
		    					});
	    				
		     			},
		     			function(userId, callback){
		     				var sql = 'SELECT * FROM user WHERE user_id=? LIMIT 1';
	    					
	    					conn.query(sql, [userId], function (err, rows) {
	    						if(err) {
	    							 conn.release();
	    							 throw err;
	    						 }
	//    						log.inspect(rows);
	    						callback(null, rows[0]);
		     					conn.release();
	    					});
		     			}
		     		],
		     		function(err, result){
		     			 if(err) {
		     				 conn.release();
		     				 throw err;
		     			 }
		     			 
	     			 	req.session.user = result;
	     			 	log.inspect(req.session.user);
	     			 	return true;
		     		});
				});
			}else{
				log.error('invalid authToken');
//				 var resultSet = {
//						 'code' : 'A_9999',
//						 'message' : 'ERROR-invalid authToken'
//				 };
//				 res.end(JSON.stringify(resultSet));
			}
		}else if(authType === 'partner'){
			log.notice('partner');
		} else{
			log.error('invalid authToken');
		}
	};

});