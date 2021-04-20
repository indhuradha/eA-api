
/*START#############################################
#
#  Purpose  : url,port details of other server which is configured in Eproofing 
#
#  Author   : Inshumathi R
#
#  Client   : SPS
#
#  Date     : April 13, 2020
#
*/

/*To get the value of environment*/
let ecoconfig = require('./../ecosystem.config.js');

var node_env, filePath, port ,imagePath, url, forkPath, dbPath,tempDbPath,imageServerPath,arsServer, arsServerPort , arsPath , refRecal,trackChange,bks,jnls,Developer_email,Admin_email= " "


if (process.env.node_env == 'development') {
    node_env = process.env.node_env;
    filePath = ecoconfig.apps[0].env_development.filePath;
    port = ecoconfig.apps[0].env_development.port;
    imagePath = ecoconfig.apps[0].env_development.imagePath;
    url = ecoconfig.apps[0].env_development.url;
    forkPath = ecoconfig.apps[0].env_development.forkPath;
    tempDbPath = ecoconfig.apps[0].env_development.tempDbPath;
    dbPath = ecoconfig.apps[0].env_development.dbPath;
    imageServerPath = ecoconfig.apps[0].env_development.imageServerPath;
    arsServer = ecoconfig.apps[0].env_development.arsServer;
    arsServerPort = ecoconfig.apps[0].env_development.arsServerPort;
    arsPath = ecoconfig.apps[0].env_development.arsPath;
    refRecal = ecoconfig.apps[0].env_development.refRecal;
    trackChange = ecoconfig.apps[0].env_development.trackChange;
    bks = ecoconfig.apps[0].env_development.bks;
    jnls = ecoconfig.apps[0].env_development.jnls;
    Developer_email = ecoconfig.apps[0].env_development.Developer_email;
    Admin_email = ecoconfig.apps[0].env_development.Admin_email;
    
    
    
}
else {
    node_env = process.env.node_env;
    filePath = ecoconfig.apps[0].env_production.filePath;
    port = ecoconfig.apps[0].env_production.port;
    imagePath = ecoconfig.apps[0].env_production.imagePath;
    url = ecoconfig.apps[0].env_production.url;
    forkPath = ecoconfig.apps[0].env_production.forkPath;
    tempDbPath = ecoconfig.apps[0].env_production.tempDbPath;
    dbPath = ecoconfig.apps[0].env_production.dbPath;
    imageServerPath = ecoconfig.apps[0].env_production.imageServerPath;
    arsServerPort = ecoconfig.apps[0].env_production.arsServerPort;
    arsServerPort = ecoconfig.apps[0].env_production.arsServerPort;
    arsPath = ecoconfig.apps[0].env_production.arsPath;
    refRecal = ecoconfig.apps[0].env_production.refRecal;
    trackChange = ecoconfig.apps[0].env_production.trackChange;
    bks = ecoconfig.apps[0].env_production.bks;
    jnls = ecoconfig.apps[0].env_production.jnls;
    Developer_email = ecoconfig.apps[0].env_production.Developer_email;
    Admin_email = ecoconfig.apps[0].env_production.Admin_email;
}


module.exports = {
    filePath, port,imagePath,url,forkPath,dbPath,tempDbPath,imageServerPath,arsServer, arsServerPort , arsPath , refRecal,trackChange,bks,jnls,Developer_email,Admin_email
}

