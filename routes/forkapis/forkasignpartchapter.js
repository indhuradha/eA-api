
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
const e = require('express');
let databaseurl = require(url_port_details.dbPath + 'db');
var async = require("async");
var _ = require('lodash');
let fs = require('fs');
const preprocessor = require('../utils/processor');


function OrderByDisplaynum(db, sql) {
    return new Promise((resolve) => {
        db.all(sql, (err, bookmat) => {
            resolve(bookmat);
        })
    })
}
function OrderByDisplaynum4Chap(db, sql1) {
    return new Promise((resolve) => {
        db.all(sql1, [], (err, val2) => {
            var part_status = '';
            if (val2.length > 0) {
                part_status = val2[0].part_status;
            }
            resolve(part_status);
        })
    })
}
function BookFrontmatter(db, Arraymat, sqlforBookFrontmatter) {
    return new Promise(function (resolve, reject) {
        db.all(sqlforBookFrontmatter, (err, bookmat) => {
            if (!_.isEmpty(bookmat)) {
                async.forEachOf(bookmat, (value, key) => {
                    Arraymat.push(value);
                })
            }
            resolve(Arraymat);
        })
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
function UpdateForPart_Status(db, unselectedValue, displaynumber) {
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            async.forEach(unselectedValue, (value, callback) => {
                if (displaynumber == 'false') {
                    var sql1 = "UPDATE chapter SET part_status = '" + 0 + "' where idtype='Chapter' AND displaynum IN ('" + value + "')";
                } else if (displaynumber == 'true') {
                    var sql1 = "UPDATE chapter SET part_status = '" + 0 + "' where idtype='Chapter' AND displaynum IN ('" + value + "')";
                } else {
                    var sql1 = "UPDATE chapter SET part_status = '" + displaynumber + "' where idtype='Chapter' AND displaynum IN ('" + value + "')";
                }
                db.all(sql1, (err, partinside) => {
                    resolve(partinside);
                })

            }, err => {
                if (err) console.error(err.message);
                db.close();
                setTimeout(function () { process.exit(); }, 1000);
            });
        });
    })
}


async function ForkAsignPartChapter(payLoad) {
    try {
        const dataFolderPath = await preprocessor.preProcessGetDataFolder(payLoad);

        if (fs.existsSync(dataFolderPath.dataFolder_book)) {
            var db = databaseurl.db(payLoad.token, payLoad.dbtype);
            if (payLoad.method == 'get') {
                var OptDetails = {};
                if (payLoad.idtype === 'PartFrontMatter') {
                    var sql = `SELECT displaynum,part_status,chaptertype,idtype from chapter where idtype='Chapter' AND displaynum !='' order by displaynum asc`;
                    var bothopt = await OrderByDisplaynum(db, sql);
                    OptDetails = { 'list_details': bothopt }
                    process.send({ counter: { status: 200, msg: OptDetails } });
                    process.exit();
                } else {
                    var sql = `SELECT displaynum,part_status,chaptertype,idtype from chapter where idtype='PartFrontMatter' AND displaynum !='' AND chapterstatus!=0 order by displaynum asc`;
                    var sql1 = "Select part_status from chapter where displaynum = '" + payLoad.displaynumber + "' and idtype='Chapter'";
                    var bothopt = await OrderByDisplaynum(db, sql);
                    var assignedpart = await OrderByDisplaynum4Chap(db, sql1);
                    OptDetails = { 'list_details': bothopt, 'assigned_part': assignedpart }
                    process.send({ counter: { status: 200, msg: OptDetails } });
                    db.close();
                    process.exit();
                }

            } else {
                if (payLoad.idtype === 'PartFrontMatter') {
                    if (payLoad.selectedValue.length > 0) {
                        await UpdateForPart_Status(db, payLoad.selectedValue, payLoad.displaynumber);
                        if (payLoad.unselectedValue.length > 0) {
                            await UpdateForPart_Status(db, payLoad.unselectedValue, 'true');

                            await BookDetails(db, payLoad);
                        } else {
                            await BookDetails(db, payLoad);
                        }
                    } else {
                        if (payLoad.unselectedValue.length >= 0) {
                            await UpdateForPart_Status(db, payLoad.unselectedValue, 'false');
                            await BookDetails(db, payLoad);
                        } else {
                            await BookDetails(db, payLoad);
                        }
                    }

                } else {
                    let sql2 = "UPDATE chapter SET part_status = '" + payLoad.selectedValue + "' where idtype='Chapter' AND displaynum ='" + payLoad.displaynumber + "'";
                    var bothopt = await OrderByDisplaynum(db, sql2);
                    await BookDetails(db, payLoad);
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
    await ForkAsignPartChapter(message);
});