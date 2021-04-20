

/*START#############################################
#
#  Purpose  : Fork method js for activeInActiveList.
#
#  Author   : Indhumathi R
#
#  Client   : E-authoring
#
#  Date     : 15 july 2020
#
######################################################################END*/
/*url_port_details.js file for port & other server endpoint details*/
let url_port_details = require('../url_port_details');
let databaseurl = require(url_port_details.dbPath + 'db');
var _ = require('lodash');
var async = require("async");
const preprocessor = require('../utils/processor');
let fs = require('fs');


function ActiveList(db, sql) {
    return new Promise((resolve) => {
        db.serialize(function () {
            db.all(sql, (err, bookmat) => {
                resolve(bookmat);
            })
        })
    });
}
function InActiveList(db, bookmat, chaptertype, chapterstatus) {
    return new Promise((resolve) => {
        db.serialize(function () {
            async.forEachOf(bookmat, (value, key) => {
                let sql = "UPDATE chapter SET chaptertype='" + chaptertype + "',chapterstatus='" + chapterstatus + "' where idtype='Chapter' AND displaynum IN ('" + value + "') AND chaptertype != 3";
                db.all(sql, (err, bookmat) => {
                    resolve(bookmat);
                })
            })
        })
    });
}

function BookFrontmatter(db, Arraymat, sqlforBookFrontmatter) {
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.all(sqlforBookFrontmatter, (err, bookmat) => {
                if (!_.isEmpty(bookmat)) {
                    async.forEachOf(bookmat, (value, key) => {
                        Arraymat.push(value);
                    })
                }
                resolve(Arraymat);
            })
        });
    })
}
function PartFrontmatter(db, Arraymat, sqlforPartFrontmatter, part_status) {
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            if (part_status == 'true') {
                db.all(sqlforPartFrontmatter, (err, parkmat) => {
                    if (!_.isEmpty(parkmat)) {
                        async.forEachOf(parkmat, (value, key) => {
                            Arraymat.push(value);
                            db.all("SELECT * FROM chapter Where idtype = 'Chapter' and part_status = '" + value.displaynum + "'", (err, partinside) => {
                                value['chapterlist'] = partinside;
                            })

                        }, err => {
                            if (err) console.error(err.message);
                        });
                    }
                    resolve(Arraymat);
                })
            } else {
                db.all(sqlforPartFrontmatter, (err, parkmat) => {
                    if (!_.isEmpty(parkmat)) {
                        async.forEachOf(parkmat, (value, key) => {
                            Arraymat.push(value);
                        })
                    }
                    resolve(Arraymat);
                })
            }
        });

    })
}
function BookFrontmatter(db, Arraymat, sqlforBookFrontmatter) {
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.all(sqlforBookFrontmatter, (err, bookmat) => {
                if (!_.isEmpty(bookmat)) {
                    async.forEachOf(bookmat, (value, key) => {
                        Arraymat.push(value);
                    })
                }
                resolve(Arraymat);
            })
        });

    })
}

async function ForkChapterlist(input, sqlSecAns, part_status) {
    try {
        var db = databaseurl.db(input.token, input.dbtype);
        var Arraymat = [];
        (async () => {
            if (part_status == 'true') {
                var sqlforBookFrontmatter = "SELECT * FROM chapter Where idtype = 'BookFrontMatter' and part_status = 0";
                var sqlforPartFrontmatter = "SELECT * FROM chapter Where idtype = 'PartFrontMatter' and part_status = 0";
                var sqlforAll = "SELECT * FROM chapter WHERE idtype not in ('BookFrontMatter','BookBackMatter','PartFrontMatter','Chapter') and part_status = 0";
                var sqlforChapter = "SELECT * FROM chapter Where idtype = 'Chapter' and part_status = 0";
                var sqlforBookBackmatter = "SELECT * FROM chapter WHERE idtype ='BookBackMatter' and part_status = 0";
            } else {
                var sqlforBookFrontmatter = "SELECT * FROM chapter Where idtype = 'BookFrontMatter'";
                var sqlforPartFrontmatter = "SELECT * FROM chapter Where idtype = 'PartFrontMatter'";
                var sqlforChapter = "SELECT * FROM chapter Where idtype = 'Chapter'";
                var sqlforAll = "SELECT * FROM chapter WHERE idtype not in ('BookFrontMatter','BookBackMatter','PartFrontMatter','Chapter')";
                var sqlforBookBackmatter = "SELECT * FROM chapter WHERE idtype ='BookBackMatter'";
            }
            await BookFrontmatter(db, Arraymat, sqlforBookFrontmatter);
            await PartFrontmatter(db, Arraymat, sqlforPartFrontmatter, part_status);
            await BookFrontmatter(db, Arraymat, sqlforChapter);
            await BookFrontmatter(db, Arraymat, sqlforAll);
            let chap_list = await BookFrontmatter(db, Arraymat, sqlforBookBackmatter);
            var Bk_chap = {
                'bookdetails': sqlSecAns,
                'chapterlistdetails': chap_list
            }

            process.send({ counter: { status: 200, msg: Bk_chap } });
            /* close the database connection  */
            db.close();
            process.exit();
        })();

    }
    catch (err) {
        console.log(err);
    }
}
function CommomForBks(sqlpri, db) {
    return new Promise(function (resolve, reject) {
        db.all(sqlpri, [], (err, row) => {
            resolve(row);
        })
    })

}

async function CallBackSplitForBks(input, sqlSecAns, db) {

    sqlSecAns[0]['chaptersubmitstatus_count'] = 0;
    let sql = "SELECT part_status FROM chapter";
    let vals = await CommomForBks(sql, db);
    if (vals == undefined) {
        sqlSecAns[0]['part_status'] = 'false';
        var sql1 = "SELECT chapterstatus FROM chapter where chapterstatus=1";
    } else {
        sqlSecAns[0]['part_status'] = 'true';
        var sql1 = "SELECT chapterstatus FROM chapter where chapterstatus=1 and part_status = 0";
    }
    let val = await CommomForBks(sql1, db);
    sqlSecAns[0]['chaptersubmitstatus_count'] = val.length;
    var part_status = sqlSecAns[0]['part_status'];

    await ForkChapterlist(input, sqlSecAns, part_status);
}

async function BookDetails(db, input) {
    let sql = `SELECT seriestitle,volumenumber,booktitle,booksubtitle,submitstatus,responsibleeditorid FROM book`;
    var sqlSecAns = await CommomForBks(sql, db);
    if (!_.isEmpty(sqlSecAns)) {
        await CallBackSplitForBks(input, sqlSecAns, db);
    } else {
        process.send({ counter: { status: 200, msg: 'No records in book table' } });
        /* close the database connection  */
        db.close();
        process.exit();

    }
}



async function ForkActiveInactiveList(input) {
    try {
        const dataFolderPath = await preprocessor.preProcessGetDataFolder(input);

        if (fs.existsSync(dataFolderPath.dataFolder_book)) {
            // open a database connection
            var db = databaseurl.db(input.booktoken, input.dbtype);
            var chaptertype = 1;
            var chapterstatus = 1;
            if (input.list == 'remove') {
                chaptertype = 0;
                chapterstatus = 0;
            }
            if (input.idtype == 'Chapter' || input.idtype == 'BookFrontMatter' || input.idtype == 'BookBackMatter') {
                let sqlquery = "UPDATE chapter SET chaptertype='" + chaptertype + "',chapterstatus='" + chapterstatus + "' WHERE token='" + input.token + "'";
                await ActiveList(db, sqlquery)
                await BookDetails(db, input);
            } else {
                var chapterid = input.chapterid;
                if (chapterid.length > 0) {
                    await InActiveList(db, chapterid, chaptertype, chapterstatus);
                }
                let sqlquery = "UPDATE chapter SET chaptertype='" + chaptertype + "',chapterstatus='" + chapterstatus + "' Where idtype = 'PartFrontMatter' AND part_status = 0 and token ='" + input.token + "'";
                await ActiveList(db, sqlquery);
                await BookDetails(db, input);
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
    await ForkActiveInactiveList(message);
});