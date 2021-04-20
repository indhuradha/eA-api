

/*START#############################################
#
#  Purpose  :Fork method js for gethtml.
#
#  Author   : Indhumathi R
#
#  Client   : E-authoring
#
#  Date     : April 21, 2020
#
######################################################################END*/
/*url_port_details.js file for port & other server endpoint details*/
let url_port_details = require('../url_port_details');
let databaseurl = require(url_port_details.dbPath + 'db');
const preprocessor = require('../utils/processor');
/* npm glob,path methods for services */
let fs = require('fs');
/* Load the full build */
var _ = require('lodash');

async function ToGetNumrefstyle(db, chapterquery, End_data, payLoad) {
    return new Promise((resolve) => {
        db.serialize(function () {
            db.all(chapterquery, (err, row) => {
                if (!_.isEmpty(row)) {
                    for (const [key, value] of Object.entries(row[0])) {
                        End_data[0][key] = value;
                    }
                }
                resolve(End_data);

            })
        })
    });
}

async function ToGetChapterStatus(db, chap_status_sql, End_data, payLoad) {
    return new Promise((resolve) => {
        db.serialize(function () {
            db.all(chap_status_sql, (err, val) => {
                if (!_.isEmpty(val)) {
                    for (const [key, value] of Object.entries(val[0])) {
                        End_data[0][key] = value;
                    }
                }
                resolve(End_data);
            })

        })
    });
}

async function ReadPath(dataFolderPath) {
    return new Promise((resolve) => {
        fs.readFile(dataFolderPath, { encoding: 'utf-8' }, function (err, content) {
            if (err) {
                resolve(err);
            } else
                resolve(content);
        })
    })
}


async function GetDataFromdb(db, payLoad, End_data) {
    return new Promise((resolve) => {
        (async () => {
            var db = databaseurl.db(payLoad.token, payLoad.dbtype);
            /* Get data from chapter table */
            let chapterquery = "SELECT numrefstyle,submitstatus FROM chapter";
            await ToGetNumrefstyle(db, chapterquery, End_data, payLoad);

            /* Get data from book table */
            let bookquery = "SELECT seriestitle FROM book";
            var db = databaseurl.db(payLoad.token, 'book');
            await ToGetNumrefstyle(db, bookquery, End_data, payLoad);
            let chap_status_sql = "SELECT chapterstatus,chaptertype FROM chapter Where token = '" + payLoad.token + "'";
            await ToGetChapterStatus(db, chap_status_sql, End_data, payLoad);
            resolve(End_data);
        })();
    })
}


async function ForkGetHtml(payLoad) {
    var End_data = [];
    const dataFolderPath = await preprocessor.preProcessGetDataFolder(payLoad);
    if (fs.existsSync(dataFolderPath.dataFilePath)) {

        End_data.push(payLoad)
        if (payLoad.type == 'bks') {
            var db = databaseurl.db(payLoad.token, payLoad.dbtype);
            await GetDataFromdb(db, payLoad, End_data);
            db.close();
        }
        const htlm_cnt = await ReadPath(dataFolderPath.dataFilePath);
        process.send({ counter: { status: 200, msg: { content: htlm_cnt, End_data } } });

    }
    else {
        process.send({ counter: { status: 400, 'msg': 'This File is ' + dataFolderPath.dataFilePath + ' not Found' } });
        setTimeout(function () { process.exit(); }, 1000);
    }
}

// receive message from master process
process.on('message', async (message) => {
    await ForkGetHtml(message)
});

