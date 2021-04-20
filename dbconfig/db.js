/*To get the value of other server url details*/
let url_port_details = require('../routes/url_port_details');
/*token.js to get the decrypted data from the token */
let jwtToken = require('../routes/token');
var sqlite3 = require('sqlite3').verbose();

module.exports =
{
    db: function (token, dbtype) {
        payLoad = jwtToken.getCyper(token);
        var filePath = '';
        if (payLoad) {
            if (dbtype == 'book') {
                filePath = url_port_details.filePath + "ea_bks/" + payLoad[0].book_no + "/";
            } else if (dbtype === 'chapter') {
                filePath = url_port_details.filePath + "ea_bks/" + payLoad[0].book_no + "/" + payLoad[0].chapter_no + '/';
            } else if (dbtype === 'jnls') {
                filePath = url_port_details.filePath + "ea_jnls/" + payLoad[0].jnls_no + "/" + payLoad[0].art_no + '/';
            }
            if(filePath){
                var correctfolderpath = filePath + 'Query_ImageAnno.data';
                var db = new sqlite3.Database(correctfolderpath, (err) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        // console.log('Connected to the sqlite database.');    
                    }
                });
            }else{
                
            var db = 'dbtype parameter is empty';
            }
          
        } else {
            var db = 'Please check with token provided';
        }
        return db;

    }
}; 
