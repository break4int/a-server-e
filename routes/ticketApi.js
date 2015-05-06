define(['app', 'color-util-logs'], 
		function(app, log){
	
	app.get('/ticket/:ticketId', function(req, res){
		ticket(req, res);
	});
	app.put('/ticket/:ticketId/use', function(req, res){
		ticketUse(req, res);
	});
	app.put('/ticket/:ticketId/cancel', function(req, res){
		ticketCancel(req, res);
	});
	
	var ticket = function(req, res) {
		res.writeHead(200, {'Content-Type':'application/json;charset=UTF-8'});
		req.dbPool.getConnection(function(err, conn) {
			var distanceSql = '';
			for(var key in req.query){
				if(key === 'q'){
					var qValues = req.query[key].split('&');
					
					for(var i=0, len=qValues.length ; i<len ; i++){
						if(qValues[i].indexOf('distance') >= 0){
							var distanceValue = qValues[i].substring((qValues[i].indexOf('distance')+'distance'.length)+1);
							var lat = distanceValue.split(',')[0];
							var lon = distanceValue.split(',')[1].split('-')[0];
							var dist = distanceValue.split(',')[1].split('-')[1];
							
							distanceSql = 'GetDistance(\'km\','+lat+', '+lon+', p.latitude, p.longitude) AS distance, ';
						}else if(qValues[i].indexOf('search') >= 0){
						}
					}
				}
			}
			var sql = ' SELECT ' +
				' t.ticket_id AS ticketId, t.partner_id AS partnerId, p.partner_image_url AS partnerImageUrl, p.partner_name AS partnerName, '+
				' p.open_time AS openTime, p.close_time AS closeTime, p.phone_number AS phoneNumber, p.introduction AS introduction, '+ 
				 distanceSql +
				' (SELECT COUNT(*) FROM ticket t1 WHERE t1.partner_id = t.partner_id) AS waitingCount,'+
				' p.reg_date AS regDate, p.upd_date AS updDate,'+
				' u.user_id AS userId, u.user_email AS userEmail, u.user_name AS userName,'+
				' u.phone_number AS u_phonwNumber, u.reg_date AS u_regDate, u.upd_date AS u_updDate,'+
				' c.ticket_type as ticketType,'+
				' t.number AS number, t.status AS status, t.is_expire AS isExpire, '+
				' t.reg_date AS t_regDate, t.upd_date AS t_updDate'+
				' FROM ticket t '+
				' INNER JOIN partner p'+
				' ON t.partner_id = p.partner_id'+
				' INNER JOIN user u'+
				' ON t.user_id = u.user_id'+
				' LEFT JOIN `call` c'+
				' ON t.ticket_id = c.ticket_id AND t.partner_id = c.partner_id'+
				' WHERE t.ticket_id = ?';
			
//			log.notice(sql);
			
			conn.query(sql, req.params.ticketId, function (err, rows) {
				 if(err) {
					 conn.release();
					 throw err;
				 }
				 log.inspect(rows);
				 
				var resultVO;
				for (var i=0 ; i<1 ; i++){
					 resultVO = {
						'ticketId' : rows[i].ticketId  || '',
					    'partner' : {
					    	'partnerId' : rows[i].partnerId  || '',
					    	'partnerImageUrl' : rows[i].partnerImageUrl  || '',
					    	'partnerName' : rows[i].partnerName  || '',
					    	'openTime' : rows[i].openTime  || '',
					    	'closeTime' : rows[i].closeTime  || '',
					    	'phoneNumber' : rows[i].phoneNumber  || '',
					    	'introduction' : rows[i].introduction  || '',
					    	'distance' : rows[i].distance  || '',
					    	'waitingCount' : rows[i].waitingCount  || '',
					    	'regDate' : rows[i].regDate  || '',
					    	'updDate' : rows[i].updDate  || ''
					    },
					    'user' : {
					    	'userId' : rows[i].userId  || '',
					    	'useEmail' : rows[i].useEmail  || '',
					    	'userName' : rows[i].userName  || '',
					    	'phoneNumber' : rows[i].u_phoneNumber  || '',
					    	'regDate' : rows[i].u_regDate  || '',
					    	'updDate' : rows[i].u_updDate  || ''
					    },
					    'ticketType' : rows[i].ticketType  || '',
					    'number' : rows[i].number  || '',
					    'status' : rows[i].status  || '',
						'isExpire' : rows[i].isExpire  || '',
						'regDate' : rows[i].regDate  || '',
						'updDate' : rows[i].updDate  || ''
					 };
				 }
				 var resultSet = {
						 'code' : 'A_0000',
						 'message' : 'OK',
						 'result' : resultVO
				 };
				 
				 res.end(JSON.stringify(resultSet));
				 conn.release();
			});
		});
	};
	
	var ticketUse = function(req, res) {
		res.writeHead(200, {'Content-Type':'application/json;charset=UTF-8'});
		req.dbPool.getConnection(function(err, conn) {
			
			var sql = 'UPDATE ticket SET status = 1, upd_date = now() WHERE ticket_id = ?';
			conn.query(sql, req.params.ticketId, function (err, rows) {
				 if(err) {
					 conn.release();
					 throw err;
				 }
				 log.inspect(rows);
				 
				 var ticketVO=[];
				 var resultSet = {
						 'code' : 'A_0000',
						 'message' : 'OK'
				 };
				 
				 res.end(JSON.stringify(resultSet));
				 conn.release();
			});
		});
	};
	
	var ticketCancel = function(req, res) {
		res.writeHead(200, {'Content-Type':'application/json;charset=UTF-8'});
		req.dbPool.getConnection(function(err, conn) {
			
			var sql = 'UPDATE ticket SET status = 2, upd_date = now() WHERE ticket_id = ?';
			conn.query(sql, req.params.ticketId, function (err, rows) {
				 if(err) {
					 conn.release();
					 throw err;
				 }
				 log.inspect(rows);
				 
				 var ticketVO=[];
				 var resultSet = {
						 'code' : 'A_0000',
						 'message' : 'OK'
				 };
				 
				 res.end(JSON.stringify(resultSet));
				 conn.release();
			});
		});
	};
});