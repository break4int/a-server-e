define(['app', 'color-util-logs'], 
		function(app, log){
	
	app.get('/user/:userId/ticket',  function(req, res){
		ticket(req, res);
	});

	var ticket = function(req, res) {
		res.writeHead(200, {'Content-Type':'application/json;charset=UTF-8'});
		req.dbPool.getConnection(function(err, conn) {
			
			var after = 0;
			var limit = 20;
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
				}else if(key === 'after'){
					after =  req.query[key];
				}else if(key === 'limit'){
					limit =  req.query[key];
				}
			}
			
			var sql = ' SELECT '+
			' t.ticket_id AS ticketId, t.partner_id AS partnerId, p.partner_image_url AS partnerImageUrl, p.partner_name AS partnerName, '+
			' p.open_time AS openTime, p.close_time AS closeTime, p.phone_number AS phoneNumber, p.introduction AS introduction, '+
			 distanceSql +
			' (SELECT COUNT(*) FROM ticket t1 WHERE t1.partner_id = t.partner_id) AS waitingCount,'+
			' p.reg_date AS p_regDate, p.upd_date AS p_updDate, t.status AS status, t.is_expire AS isExpire, '+
			' t.reg_date AS regDate, t.upd_date AS updDate'+
			' FROM ticket t '+
			' INNER JOIN partner p'+
			' ON t.partner_id = p.partner_id'+
			' WHERE t.user_id=?'+
			' LIMIT '+after+', '+limit;
			
			log.notice(sql);
			
			conn.query(sql, req.params.userId, function (err, rows) {
				 if(err) {
					 conn.release();
					 throw err;
				 }
				 log.inspect(rows);
				 
				 var ticketVO=[];
				 for (var i=0,len=rows.length ; i<len ; i++){
					 var ticket ={
					    'ticketId' : rows[i].ticketId || '',
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
					    'status' : rows[i].status,
					    'isExpire' : rows[i].isExpire,
					    'regDate' : rows[i].regDate,
					    'updDate' : rows[i].updDate,
					 };
					 ticketVO[i]=ticket;
				 }
				 var resultSet = {
						 'code' : 'A_0000',
						 'message' : 'OK',
						 'result' :{
							 'list' : ticketVO,
							 'after' : after,
							 'limit' : limit,
							 'totalCount' : getAllCount(rows)
						 }
				 };
				 
				 res.end(JSON.stringify(resultSet));
				 conn.release();
			});
		});
	};
	
	function getAllCount(x){
		if(x === undefined){
			return 0;
		}
		return x.length;
	}
});