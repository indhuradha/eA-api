
/*START#############################################
#
#  Purpose  : Process file which will set the mode to development or environment
#
#  Author   : Indhumathi R
#
#  Client   : SPS
#
#  Date     : 13 April 2020
#
*/


module.exports = {
    apps: [
        {
            name: "eproofing-api",
            script: "./server.js",
            watch: true,
            exec_mode: "fork",
            env_development: {
                "port": "3001",
				"node_env": "development",
                "filePath": "/u01/eatd/ne/react_data/",
                "forkPath": "/u01/ea-api/routes/forkapis/",
                "tempDbPath": "/u01/ea-api/routes/",
                "dbPath": "/u01/ea-api/dbconfig/",
                "imagePath": "images",
                "url": "http://eproofing-dev.springernature.com",
                "imageServerPath":"http://eproofing-dev.springernature.com",
                "trackChange" : "/u01/eatd/ne/daisydiff/daisydiff.jar",
				"refRecal" : "http://eproofing-dev.springernature.com:3001/eA-api/reference/",
                "bks":"ea_bks/",
                "jnls":"ea_jnls/",
                "Developer_email":"indhumathi.r@sps.co.in",
                "Admin_email":"jgayathri@sps.co.in"
            },
            env_production: {
                "port": "3001",
				"node_env": "production",
                "filePath": "/u01/eatd/ne/react_data/",
                "forkPath": "/u01/ea-api/routes/forkapis/",
                "tempDbPath": "/u01/ea-api/routes/",
                "dbPath": "/u01/ea-api/dbconfig/",
                "imagePath": "images",
                "url": "http://eproofing-dev.springernature.com",
                "imageServerPath":"http://eproofing-dev.springernature.com",
                "trackChange" : "/u01/eatd/ne/daisydiff/daisydiff.jar",
				"refRecal" : "http://eproofing-dev.springernature.com:3001/eA-api/reference/",
                "bks":"ea_bks/",
                "jnls":"ea_jnls/",
                "Developer_email":"indhumathi.r@sps.co.in",
                "Admin_email":"jgayathri@sps.co.in"
            }
        }
    ]
}
