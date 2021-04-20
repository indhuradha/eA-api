
/*START#############################################
#
#  Purpose  :Fork method js for forkIndexTerm.
#
#  Author   : Indhumathi R
#
#  Client   : e-authoring
#
#  Date     : April 27, 2020
#
######################################################################END*/

/*url_port_details.js file for port & other server endpoint details*/
let url_port_details = require('../url_port_details');
let databaseurl = require(url_port_details.dbPath + 'db');
let fs = require('fs');
var _ = require('lodash');
const preprocessor = require('../utils/processor');
var moment = require('moment');

function CommomForIndexterm(sqlpri, db, inputData) {
    return new Promise(function (resolve, reject) {
        db.all(sqlpri, inputData, (err, row) => {
            if (err) {
                reject(row);
            } else {
                resolve(row);
            }
        })
    })

}
function CreateLogFile(signalWriteFolder, signalWriteFilePath, logcnt) {
    return new Promise(function (resolve, reject) {
        if (!fs.existsSync(signalWriteFolder + '/')) {
            fs.mkdirSync(signalWriteFolder);
        }

        if (!fs.existsSync(signalWriteFilePath)) {
            fs.writeFile(signalWriteFilePath, logcnt, function (err) {
                resolve(logcnt);
            })
        }
        else {
            fs.readFile(signalWriteFilePath, { encoding: 'utf-8' }, function (err, content) {
                fs.writeFile(signalWriteFilePath, content + '\n' + logcnt, function (err) {
                    resolve(logcnt);
                })
            })

        }
    })

}


async function ForkIndexTerm(payLoad) {
    try {
        const dataFolderPath = await preprocessor.preProcessGetDataFolder(payLoad);
        let current_time = moment().format('YYYY-MM-DD, hh:mm:ss a');

        if (fs.existsSync(dataFolderPath.dataFolder_book)) {
            // open a database connection
            var db = databaseurl.db(payLoad.token, payLoad.dbtype);
            var indextermtype = payLoad.indextermtype;
            var signalWriteFilePath = dataFolderPath.dataFolderPath + 'log.txt';
            var getIndexTerm = [];
            if (indextermtype == 'getIndexTerm') {
                var inputData = [];
                let sqlpri = "SELECT DISTINCT primaryterm FROM indextable where status!=3 AND primaryterm IS NOT NULL";
                let sqlsec = "SELECT DISTINCT secondaryterm FROM indextable where status!=3  AND secondaryterm IS NOT NULL";
                let sqlPriAns = await CommomForIndexterm(sqlpri, db, inputData);
                getIndexTerm.push(sqlPriAns)
                let sqlSecAns = await CommomForIndexterm(sqlsec, db, inputData);
                getIndexTerm.push(sqlSecAns)
                process.send({ counter: { status: 200, msg: getIndexTerm } });
                process.exit();

            }
            else if (indextermtype === 'insert') {
                let chapterid = (payLoad.chapter_no).split('_')[0];
                var status = 1;
                let inputData = [payLoad.primaryterm, payLoad.secondaryterm, payLoad.tertiaryterm, payLoad.seeterm, payLoad.seealsoterm, chapterid, payLoad.token, status];

                let sqlpri = 'INSERT INTO indextable(primaryterm, secondaryterm, tertiaryterm, seeterm, seealsoterm, chapterid ,token, status) VALUES(?, ?, ?, ?, ?, ? ,? ,?)';
                await CommomForIndexterm(sqlpri, db, inputData);
                let sqlsec = 'SELECT id FROM indextable ORDER BY id DESC LIMIT 1';
                let inputData2 = [];
                let sqlSecAns = await CommomForIndexterm(sqlsec, db, inputData2);
                if (!_.isEmpty(sqlSecAns)) {
                    var logcnt = current_time + ' Added new index term.Primary term: ' + payLoad.primaryterm + ', secondaryterm:' + payLoad.secondaryterm + ', tertiary term:' + payLoad.tertiaryterm + ', Index term id :' + sqlSecAns[0].id + '   ' + current_time;
                } else {
                    var logcnt = current_time + ' Indexterm is failed to insert   ' + current_time;
                }
                await CreateLogFile(dataFolderPath.dataFolderPath, signalWriteFilePath, logcnt);
                process.send({ counter: { status: 200, msg: sqlSecAns } });
                process.exit();
            }
            else if (indextermtype === 'edit') {
                let chapterid = (payLoad.chapter_no).split('_')[0];
                var status = 1;
                var inputData = [payLoad.primaryterm, payLoad.secondaryterm, payLoad.tertiaryterm, payLoad.seeterm, payLoad.seealsoterm, chapterid, payLoad.token, status, payLoad.id];
                let sql = `UPDATE indextable
            SET primaryterm = ?, secondaryterm = ?, tertiaryterm = ?, seeterm = ?, seealsoterm = ?,chapterid = ?, token = ?, status = ?
            WHERE id = ?`;
                let sqlSecAns = await CommomForIndexterm(sql, db, inputData);
                if (!_.isEmpty(sqlSecAns)) {
                    var logcnt = current_time + ' Updated index term.Primary term: ' + payLoad.primaryterm + ', secondaryterm:' + payLoad.secondaryterm + ', tertiary term:' + tertiaryterm + ', Index term id :' + payLoad.id + '   ' + current_time;
                } else {
                    var logcnt = current_time + ' Indexterm is failed to Edit   ' + current_time;
                }
                await CreateLogFile(dataFolderPath.dataFolderPath, signalWriteFilePath, logcnt);
                process.send({ counter: { status: 200, msg: sqlSecAns } });
                process.exit();

            } else if (indextermtype === 'delete') {
                var termtype = payLoad.termtype;
                var term = payLoad.term;
                var id = payLoad.id;
                if (termtype == 'Primary') {
                    var sql = "SELECT * FROM indextable where primaryterm='" + term + "' AND status !=3 AND secondaryterm IS NOT NULL";
                } else {
                    var sql = "SELECT * FROM indextable where secondaryterm='" + term + "' AND status !=3 AND tertiaryterm IS NOT NULL";

                }

                let inputDatas = [];
                let sqlSecAns = await CommomForIndexterm(sql, db, inputDatas);
                if (sqlSecAns.length > 0) {
                    let logcnt = current_time + `${"Can't delete row"}` + current_time;
                    await CreateLogFile(dataFolderPath.dataFolderPath, signalWriteFilePath, logcnt);
                    process.send({ counter: { status: 200, msg: `${"Can't delete row"}` } });
                    process.exit();

                } else {

                    var inputData = ['3', id];
                    let sql = `UPDATE indextable SET status = ? WHERE id = ?`
                    let sqlSec = await CommomForIndexterm(sql, db, inputData);
                    if (sqlSec.length == 0) {
                        var finaldata = `${"status is updated sucessfully"}`;
                        var logcnt = current_time + ' Deleted Index term id : ' + id + '   ' + current_time;
                    } else {
                        var finaldata = `${"Can't delete row"}`;
                        var logcnt = current_time + 'Indexterm is failed to delete   ' + current_time;
                    }
                    await CreateLogFile(dataFolderPath.dataFolderPath, signalWriteFilePath, logcnt);
                    process.send({ counter: { status: 200, msg: finaldata } });
                    process.exit();
                }
            }
        } else {
            process.send({ counter: { status: 400, msg: 'File is not exits in this path ' + dataFolderPath.dataFolder_book } });
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
    await ForkIndexTerm(message);
});