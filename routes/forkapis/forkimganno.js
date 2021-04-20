
/*START#############################################
#
#  Purpose  :Fork method js for imganno.
#
#  Author   : Indhumathi R
#
#  Client   : eproofing
#
#  Date     : April 12, 2020
#
######################################################################END*/

/*url_port_details.js file for port & other server endpoint details*/
let url_port_details = require('../url_port_details');
let databaseurl = require(url_port_details.dbPath + 'db');
const preprocessor = require('../utils/processor');
let fs = require('fs');

function CommomQuery(type, db, sqlquery, inputData) {
    return new Promise(function (resolve, reject) {
        db.all(sqlquery, inputData, (err, data) => {
            resolve(data);
            reject(err);
        })
    })

}
async function ForkImganno(payLoad) {
    try {
        const dataFolderPath = await preprocessor.preProcessGetDataFolder(payLoad);

        if (fs.existsSync(dataFolderPath.dataFolder_book)) {
        /*  open a database connection  */
        var db = databaseurl.db(payLoad.token, payLoad.dbtype);
        var method = payLoad.method;
        var imgannotype = payLoad.imgannotype;
        /*  Get the all data from imganno table */
        if (method === 'get') {
            var inputData = [];
                var sqlquery = "SELECT * FROM imganno";
            let opt = await CommomQuery(imgannotype, db, sqlquery, inputData);
                process.send({ counter: { status: 200, msg: opt } });
                db.close();
                process.exit();  
        } else {
            var width = payLoad.width;
            var height = payLoad.height;
            var left = payLoad.left;
            var top = payLoad.top;
            var test = payLoad.test;
            var id = payLoad.id;

            if (imgannotype === 'insert') {
                var inputData = [test, id, payLoad.ImageTagId, top, left, width, height];
                var sqlquery = 'INSERT INTO imganno(test, id, ImageTagId, top, left, width, height) VALUES(?, ?, ?, ?, ?, ?, ?)';

            } else if (imgannotype === 'update') {
                var inputData = [test, width, height, top, left, id];
                var sqlquery = `UPDATE imganno
                    SET  test = ?, width = ?, height = ?, top = ?, left = ?
                    WHERE id = ?`;

            } else if (imgannotype === 'delete') {
                var inputData = payLoad.id;
                var sqlquery = `DELETE FROM imganno WHERE id=?`;
            }
            await CommomQuery(imgannotype, db, sqlquery, inputData);
            process.send({ counter: { status: 200, msg: 'Data is created' } });
            db.close();
            process.exit();

        } } else {
            process.send({ counter: { status: 400, msg: 'File is not exits in this path '+dataFolderPath.dataFolder_book } });
            process.exit();
        }
    }
    catch (error) {
        process.send({ counter: { status: 400, msg: error } });
        process.exit();
    }
}

// receive message from master process
process.on('message', async (message) => {
    await ForkImganno(message);
});