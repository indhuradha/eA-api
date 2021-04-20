
/*START#############################################
#
#  Purpose  :Fork method js for savehtml.
#
#  Author   : Indhumathi R
#
#  Client   : e-authoring
#
#  Date     : April 23, 2020
#
######################################################################END*/



const preprocessor = require('../utils/processor');
// /*To get the value of other server url details*/
let url_port_details = require('../url_port_details');
/* npm glob,path methods for services */
// let glob = require('glob');
let fs = require('fs');
var d = new Date().toString();
var index = d.lastIndexOf(':') + 3;
var finalD = d.substring(0, index);
var async = require("async");
let databaseurl = require(url_port_details.dbPath + 'db');
var _ = require('lodash');


async function ToGetChapterStatus(db, chap_status_sql) {
    return new Promise((resolve) => {
        db.serialize(function () {
            db.all(chap_status_sql, (err, val) => {
                resolve(val);
            })

        })
    });
}

async function ReadPath(file_Path, dataFolderPath, payLoad, signalWriteFilePath, chap_type) {

    (async () => {
        fs.writeFile(file_Path, payLoad.savecontent, function (err) {
            /*error occurs in saving the html content fails*/
            if (err) {
                var logcnt = finalD + ' File save: Save operation failed   ' + finalD;
            }
            else {
                var logcnt = finalD + ' File save: chapter saved successfully   ' + finalD;
            }
            fs.readFile(file_Path, { encoding: 'utf-8' }, function (err, htlm_cnt) {

                const LogFile = {
                    'dataFolderPath': dataFolderPath.dataFolderPath, 'signalWriteFilePath': signalWriteFilePath, 'logcnt': logcnt, 'file_Path': file_Path

                }
                const data_LogFile =  preprocessor.preProcessCreateLogFile(LogFile);
                process.send({ counter: { status: 200, msg: data_LogFile } });
            })
        });
    })();
}


async function ForkSaveHtml(payLoad) {

    const dataFolderPath = await preprocessor.preProcessGetDataFolder(payLoad);
    var signalWriteFilePath = dataFolderPath.dataFolderPath + 'log.txt';
    var file_Path = dataFolderPath.dataFilePath;
    if(payLoad.type == 'bks'){
        var db = databaseurl.db(payLoad.token, 'book');

        let chap_status_sql = "SELECT chapterstatus,chaptertype FROM chapter Where token = '" + payLoad.token + "'";
        let chap_type = await ToGetChapterStatus(db, chap_status_sql);
        if (!_.isEmpty(chap_type)) {
            if (chap_type[0].chaptertype == 2 || chap_type[0].chaptertype == 1) {

                if (fs.existsSync(file_Path)) {
                    fs.renameSync(file_Path, file_Path + '.' + new Date().getTime() + '.bak');
                }

                ReadPath(file_Path, dataFolderPath, payLoad, signalWriteFilePath);

            } else {
                process.send({ counter: { status: 400, msg: 'chapter is already removed' } });
                process.exit();

            }

        } else {
            process.send({ counter: { status: 400, msg: 'No record found in book db' } });
            process.exit();

        }
    } else {
        if (fs.existsSync(file_Path)) {
            fs.renameSync(file_Path, file_Path + '.' + new Date().getTime() + '.bak');
        }

        ReadPath(file_Path, dataFolderPath, payLoad, signalWriteFilePath);


    }



}
// receive message from master process
process.on('message', async (message) => {
    await ForkSaveHtml(message);
});