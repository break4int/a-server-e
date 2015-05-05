exports.partner = function(req, res){
	res.writeHead(200, {'Content-Type':'application/json;charset=UTF-8'});
	req.dbPool.getConnection(function(err, conn) {
		var after = 0;
		var limit = 20;
		var distanceSql = '';		var whereSql = '';
		var havingSql = '';
		
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
						havingSql = 'HAVING distance <= '+dist+' ';
					}else if(qValues[i].indexOf('search') >= 0){
					}
				}
			}else if(key === 'after'){
				after =  req.query[key];
			}else if(key === 'limit'){
				limit =  req.query[key];
			}
		}
		
		if(req.params.partnerId){
			whereSql = 'AND p.partner_id='+req.params.partnerId;
			havingSql = '';
			after = 0;
			limit = 20;
		}

		var sql = 'SELECT '+
			'p.partner_id AS partnerId,p.partner_image_url AS partnerImageUrl,p.partner_name AS partnerName, '+
			'p.open_time AS openTime, p.close_time AS closeTime,p.phone_number AS phoneNumber, p.introduction, '+
			 distanceSql+
			'(SELECT COUNT(*) FROM ticket t WHERE t.partner_id = p.partner_id) AS waitingCount, '+
			'p.reg_date AS regDate, p.upd_date AS updDate '+
			'FROM partner p '+
			'WHERE 1=1 ' + whereSql +' '+
			havingSql+
			'LIMIT '+after+', '+limit;
		
		log.notice(sql);
		
		conn.query(sql, function (err, rows) {
			 if(err) {
				 conn.release();
				 throw err;
			 }
			 
			 var resultSet = {
					 code : 'A_0000',
					 message : 'OK'
			 };
			 
			 if(!req.params.partnerId){
				resultSet = {
					code : 'A_0000',
					message : 'OK',
					result : {
						list : rows,
						after : after,
						limit : limit,
						totalCount : getAllCount(rows)
						}
				 };
			 }else{
				 resultSet = {
							code : 'A_0000',
							message : 'OK',
							result : rows[0]
						 };

			 }
			 log.inspect(rows);
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