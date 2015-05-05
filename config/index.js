var config = {
    local: {
        mode: 'local',
        port: 3000,
        mysql : {
        	host : 'localhost',
        	post : '3306',
        	user : 'root',
        	password : 'qwer1234',
        	database : 'americano',
        	connectionLimit : 10,
        	waitForconnections : true
        }
    },
    dev : {
    	mode: 'dev',
        port: 3000,
        mysql : {
        	host : 'cloud.abiyo.co.kr',
        	post : '3306',
        	user : 'americano',
        	password : 'america',
        	database : 'americano',
        	connectionLimit : 10,
        	waitForconnections : true
        }
    },
    stg: {
        mode: 'stg',
        port: 4000,
        mysql : {
        	host : 'localhost',
        	post : '3306',
        	user : 'americano',
        	password : 'america',
        	database : 'americano',
        	connectionLimit : 10,
        	waitForconnections : true
        }
    },
    prd: {
        mode: 'prd',
        port: 5000,
        mysql : {
        	host : 'localhost',
        	post : '3306',
        	user : 'americano',
        	password : 'america',
        	database : 'americano',
        	connectionLimit : 10,
        	waitForconnections : true
        }
    }
};

module.exports = function(mode) {
    return config[mode || process.argv[2] || 'dev'] || config.dev;
};
