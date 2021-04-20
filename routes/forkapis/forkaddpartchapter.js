
/*START#############################################
#
#  Purpose  :Fork method js for Addpartchapter.
#
#  Author   : Indhumathi R
#
#  Client   : e-authoring
#
#  Date     : July 15, 2020
#
######################################################################END*/

/*url_port_details.js file for port & other server endpoint details*/
let url_port_details = require('../url_port_details');
let databaseurl = require(url_port_details.dbPath + 'db');
/*token.js to get the encrypted data from the token */
let jwtToken = require('../token.js');
const fs = require('fs');
var async = require("async");
var _ = require('lodash');
const preprocessor = require('../utils/processor');
var path = require('path');
let xpath = require('xpath'), dom = require('xmldom').DOMParser;
var parseString = require('xml2js').parseString;
let js2xmlparser = require("js2xmlparser");

var DOMParser = require('xmldom').DOMParser;
var parser = new DOMParser();

async function CommomForBks(sqlpri, db) {
    return new Promise(function (resolve, reject) {
        db.all(sqlpri, [], (err, row) => {
            resolve(row);
        })
    })

}
const option = {
    explicitArray: true, pretty: false,
    explicitCharkey: true, trim: true, charkey: '#', emptyTag: { "#": '' },
    attrkey: '@', preserveChildrenOrder: true, mergeAttrs: false, ignoreAttrs: false, charsAsChildren: true, explicitRoot: true
}
async function create_chap_tmp_file(newPartMatter, doc_chp_tmp, bk_db_d, title) {
    return new Promise(function (resolve, reject) {
        try {
            var DOMParser = require('xmldom').DOMParser;
            var parser = new DOMParser();
            var ref_numbered = 'numbered';
            var ref_sectionnumber = 'numbered';
            if (bk_db_d.numrefstyle != 1) {
                ref_numbered = 'unnumbered';
            }
            if (bk_db_d.sectionnumber != 1) {
                ref_sectionnumber = 'unnumbered';
            }
            parseString(doc_chp_tmp, option
                , function (err, chap_Info) {
                    chap_Info.div['@']['id'] = `${'Chap'}${newPartMatter}`;
                    chap_Info.div['@']['referencetype'] = `${ref_numbered}`;
                    chap_Info.div['@']['sectiontype'] = `${ref_sectionnumber}`;

                    chap_Info.div.div.map(function (value, key) {
                        if (ref_sectionnumber == 'unnumbered') {
                            if (value['@']['class'] == 'Body') {
                                delete value['div'][0]['span']

                            }
                        }
                        if (value['@']['name'] == 'ChapterTitle') {
                            value['#'] = title;
                        }
                        if (ref_numbered == 'unnumbered') {
                            if (value['@']['class'] == 'ChapterBackmatter') {
                                value['div'][0]['div'].map(function (val, key) {
                                    if (val.span != undefined) {
                                        delete val.span;
                                    }
                                })
                            }
                        }
                        if (value['ChapterInfo'] !== undefined) {
                            value['ChapterInfo'][0]['ChapterID'] = newPartMatter;
                            value['ChapterInfo'][0]['ChapterNumber'] = newPartMatter;
                            value['ChapterInfo'][0]['ChapterNumber'] = newPartMatter;
                            value['ChapterInfo'][0]['BookID'] = bk_db_d.bookid;
                            value['ChapterInfo'][0]['BookTitle'] = bk_db_d.booktitle;
                        }

                    })
                    var chap_Info_j_to_x = js2xmlparser.parse('sample', chap_Info, {
                        useSelfClosingTagIfEmpty: false,
                        format: { doubleQuotes: true, pretty: false },
                        declaration: { include: false }
                    });
                    chap_Info_j_to_x = chap_Info_j_to_x.replace('<sample>', '');
                    chap_Info_j_to_x = chap_Info_j_to_x.replace('</sample>', '');
                    var doc_chap_Info_j_to_x = parser.parseFromString(chap_Info_j_to_x, 'text/xml');
                    resolve(doc_chap_Info_j_to_x)
                })
        } catch (e) {
            reject('Error form chapter template file')

        }
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
async function ForkAddPartChapter(payLoad) {
    try {
        const dataFolderPath = await preprocessor.preProcessGetDataFolder(payLoad);

        if (fs.existsSync(dataFolderPath.dataFolder_book)) {
            var book_no = payLoad.book_no;
            var type = payLoad.type;
            var booktoken = payLoad.fields.booktoken;
            var part_status = payLoad.fields.part_status;
            var dbtype = payLoad.fields.dbtype;
            var db = databaseurl.db(payLoad.fields.booktoken, dbtype);
            if (payLoad.fields.addtype == 'Part') {
                var addtype = 'PartFrontMatter';
            } else {
                var addtype = 'Chapter';
            }
            db.serialize(function () {
                db.all("SELECT * FROM chapter WHERE idtype ='" + addtype + "' AND displaynum != ''", (err, row) => {
                    if (err) {
                        process.send({ counter: { status: 400, msg: err } });
                        db.close();
                        process.exit();
                    }
                    else {
                        if (row.length > 0) {
                            var chapterdbLength = row.length;
                        } else {
                            var chapterdbLength = 0;

                        }
                        var metaHtml = url_port_details.filePath + url_port_details[type] + book_no + '/' + 'Metadata.html';
                        var newPartMatter = chapterdbLength + 1;
                        var chapter_no = newPartMatter;
                        newToken = { 'book_no': book_no, 'chapter_no': chapter_no + '_' + addtype, 'type': type };
                        var createToken = jwtToken.getEncrypt(newToken);

                        if (payLoad.fields.addtype == 'uploadimage') {
                            inputData = [createToken, addtype, payLoad.fields.title, newPartMatter, 0, 0, 3, 0]
                            db.run('INSERT INTO chapter(token, idtype, chaptertitle, displaynum, chapterstatus ,authorreview, chaptertype , part_status) VALUES(?, ?, ?, ?, ? ,? ,? ,?)', inputData, (err, data) => {
                                /* Temporary location of our uploaded file */

                                var temp_path = payLoad.files.files.path;
                                var doc_ext = path.extname(payLoad.files.files.name);
                                /* Location where we want to copy the uploaded file */
                                var signalWriteFolder = url_port_details.filePath + url_port_details[type] + book_no + '/' + chapter_no + '_' + addtype + '/';
                                var signalWriteFilePath = url_port_details.filePath + url_port_details[type] + book_no + '/' + chapter_no + '_' + addtype + '/' + book_no + '_' + chapter_no + '_' + addtype + doc_ext;
                                if (!fs.existsSync(signalWriteFolder)) {
                                    fs.mkdirSync(signalWriteFolder);
                                }
                                if (!fs.existsSync(signalWriteFilePath)) {
                                    const fs = require('fs-extra');
                                    fs.copy(temp_path, signalWriteFilePath, function (err) {
                                        if (err) {
                                            process.send({ counter: { status: 400, msg: err } });
                                            db.close();
                                            process.exit();
                                        } else {
                                            var temp_Newdbpath = url_port_details.tempDbPath + 'Query_ImageAnno.data';
                                            var new_locationdbpath = url_port_details.filePath + url_port_details[type] + book_no + '/' + chapter_no + '_Chapter/Query_ImageAnno.data';
                                            var uploadPath = url_port_details.filePath + url_port_details[payLoad.type] + book_no + '/' + chapter_no + '_Chapter/upload';
                                            var imagesPath = url_port_details.filePath + url_port_details[payLoad.type] + book_no + '/' + chapter_no + '_Chapter/images';
                                            const fs = require('fs-extra');

                                            db.all("SELECT booktitle FROM book", (err, val) => {
                                                fs.copy(temp_Newdbpath, new_locationdbpath, function (err) {
                                                    if (err) {
                                                        process.send({ counter: { status: 400, msg: err } });
                                                        process.exit();
                                                    } else {
                                                        if (!fs.existsSync(uploadPath)) {
                                                            fs.mkdirSync(uploadPath);
                                                        }
                                                        if (!fs.existsSync(imagesPath)) {
                                                            fs.mkdirSync(imagesPath);
                                                        }
                                                        var db = databaseurl.db(createToken, 'chapter');
                                                        inputDatas = [val[0].booktitle, payLoad.fields.title, '', 1, 0]
                                                        db.run('INSERT INTO chapter(bookname, chaptertitle, chapterdoi, submitstatus, numrefstyle) VALUES(?, ?, ?, ?, ?)', inputDatas, (err, data) => {
                                                            (async () => {
                                                                var db = databaseurl.db(booktoken, 'book');
                                                                let sql = `SELECT seriestitle,volumenumber,booktitle,booksubtitle,submitstatus,responsibleeditorid FROM book`;
                                                                var sqlSecAns = await CommomForBks(sql, db);
                                                                if (!_.isEmpty(sqlSecAns)) {
                                                                    await CallBackSplitForBks(booktoken, payLoad.fields.part_status, sqlSecAns, db);
                                                                } else {
                                                                    process.send({ counter: { status: 200, msg: 'No records in book table' } });
                                                                    /* close the database connection  */
                                                                    db.close();
                                                                    process.exit();

                                                                }
                                                            })();
                                                        })
                                                    }
                                                });
                                            })
                                        }
                                    })
                                } else {
                                    process.send({ counter: { status: 400, msg: `${signalWriteFilePath}${' file path is already exits '}` } });
                                    process.exit();
                                }
                            })
                        } else {
                            if (fs.existsSync(metaHtml)) {
                                fs.readFile(metaHtml, { encoding: 'utf-8' }, function (err, meta_content) {
                                    var xmlDoc = parser.parseFromString(meta_content, 'text/xml');
                                    var find_lang = xpath.select('//div[@class="Book"]', xmlDoc);
                                    if (find_lang != undefined) {
                                        if (payLoad.fields.addtype == 'template') {
                                            chaptertype = 2;
                                            var meta_chap_temp = url_port_details.tempDbPath + 'Template_Chapter.html';
                                        } else {
                                            chaptertype = 1;

                                            var meta_chap_temp = url_port_details.tempDbPath + 'Template_Part.html';
                                        }
                                        inputData = [createToken, addtype, payLoad.fields.title, newPartMatter, 1, 0, chaptertype, 0]
                                        db.run('INSERT INTO chapter(token, idtype, chaptertitle, displaynum, chapterstatus ,authorreview, chaptertype , part_status) VALUES(?, ?, ?, ?, ? ,? ,? ,?)', inputData, (err, data) => {

                                            fs.readFile(meta_chap_temp, { encoding: 'utf-8' }, function (err, meta_chp_tmp) {
                                                var signalWriteFolder = url_port_details.filePath + url_port_details[payLoad.type] + book_no + '/' + chapter_no + '_' + addtype;
                                                var signalWriteFilePath = url_port_details.filePath + url_port_details[payLoad.type] + book_no + '/' + chapter_no + '_' + addtype + '/' + book_no + '_' + chapter_no + '_' + addtype + '.html';
                                                if (!fs.existsSync(signalWriteFolder)) {
                                                    fs.mkdirSync(signalWriteFolder);
                                                }
                                                if (payLoad.fields.addtype == 'Part') {
                                                    PartHtml(newPartMatter, book_no, payLoad.fields, meta_chp_tmp, find_lang, xmlDoc, chapter_no, db, booktoken, part_status, dbtype, signalWriteFilePath, createToken, type)

                                                } else {
                                                    ChapterHtml(newPartMatter, book_no, payLoad.fields, meta_chp_tmp, find_lang, xmlDoc, chapter_no, db, booktoken, part_status, dbtype, signalWriteFilePath, createToken, type)
                                                }
                                            })

                                        })
                                    }
                                    else {

                                        process.send({ counter: { status: 400, msg: chapter_no + 'Cant able process in meta html file' } });
                                        db.close();
                                        process.exit();

                                    }
                                })
                            } else {
                                process.send({ counter: { status: 400, msg: 'Metadata html file is not available' } });
                                db.close();
                                process.exit();

                            }
                        }
                    }
                })
            });


        } else {
            process.send({ counter: { status: 400, msg: 'File is not exits in this path ' + dataFolderPath.dataFolder_book } });
            process.exit();
        }
    }
    catch (error) {
        process.send({ counter: error });
    }
}
async function ForkChapterlist(booktoken, part_status, sqlSecAns) {
    try {
        var db = databaseurl.db(booktoken, 'book');
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
async function CallBackSplitForBks(booktoken, part_status, sqlSecAns, db) {

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

    await ForkChapterlist(booktoken, part_status, sqlSecAns);
}

async function create_part_tmp_file(newPartMatter, meta_chp_tmp, bk_db_d, title) {
    return new Promise(function (resolve, reject) {
        parseString(meta_chp_tmp, option
            , function (err, chap_Info) {
                chap_Info.div['@']['id'] = `${'Part'}${newPartMatter}`;
                chap_Info.div.div.map(function (val, key) {
                    if (val['@']['name'] == 'PartTitle') {
                        val['#'] = title;
                    } else {
                        val['PartInfo'][0]['PartId'] = `${newPartMatter}`;
                        val['PartInfo'][0]['PartSequenceNumber'] = `${newPartMatter}`;
                        val['PartInfo'][0]['PartTitle'] = `${title}`;
                        val['PartInfo'][0]['BookId'] = `${bk_db_d.bookid}`;
                        val['PartInfo'][0]['BookTitle'] = `${bk_db_d.booktitle}`;

                    }

                })
                var chap_Info_j_to_x = js2xmlparser.parse('sample', chap_Info, {
                    useSelfClosingTagIfEmpty: false,
                    format: { doubleQuotes: true, pretty: false },
                    declaration: { include: false }
                });
                chap_Info_j_to_x = chap_Info_j_to_x.replace('<sample>', '');
                chap_Info_j_to_x = chap_Info_j_to_x.replace('</sample>', '');
                var doc_chap_Info_j_to_x = parser.parseFromString(chap_Info_j_to_x, 'text/xml');

                resolve(doc_chap_Info_j_to_x);
            })
    })
}


function PartHtml(newPartMatter, book_no, fields, meta_chp_tmp, find_lang, xmlDoc, chapter_no, db, booktoken, part_status, dbtype, signalWriteFilePath, createToken, type) {
    var db = databaseurl.db(booktoken, dbtype);
    (async () => {
        let sql = `SELECT bookid,booktitle FROM book`;
        let bk_db_d = await CommomForBks(sql, db);
        let t = await create_part_tmp_file(newPartMatter, meta_chp_tmp, bk_db_d[0], fields.title);
        find_lang[0].appendChild(t);
        var temp_Newdbpath = url_port_details.tempDbPath + 'Query_ImageAnno.data';
        var new_locationdbpath = url_port_details.filePath + url_port_details[type] + book_no + '/' + chapter_no + '_PartFrontMatter/Query_ImageAnno.data';
        await Create_chap_part(xmlDoc.toString(), temp_Newdbpath, new_locationdbpath, '', '', fields, booktoken, part_status, signalWriteFilePath, createToken, bk_db_d[0]);

    })();
}
async function Create_chap_part(xmlDoc, temp_Newdbpath, new_locationdbpath, uploadPath, imagesPath, fields, booktoken, part_status, signalWriteFilePath, createToken, bk_db_d) {
    if (fields.addtype !== 'Part') {
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        if (!fs.existsSync(imagesPath)) {
            fs.mkdirSync(imagesPath);
        }
    }
    fs.writeFile(signalWriteFilePath, xmlDoc, function (err) {
        fs.writeFile(signalWriteFilePath + '.org', xmlDoc, function (err) {
            if (err) {
                process.send({ counter: { status: 400, msg: chapter_no + ' org is not created.' } });
                db.close();
                process.exit();
            } else {
                const fs = require('fs-extra');
                fs.copy(temp_Newdbpath, new_locationdbpath, function (err) {
                    if (err) {
                        process.send({ counter: { status: 400, msg: err } });
                        process.exit();
                    } else {
                        var db = databaseurl.db(createToken, 'chapter');
                        inputDatas = [bk_db_d.booktitle, fields.title, '', 1, 0];
                        db.run('INSERT INTO chapter(bookname, chaptertitle, chapterdoi, submitstatus, numrefstyle) VALUES(?, ?, ?, ?, ?)', inputDatas, (err, data) => {
                            (async () => {
                                var db = databaseurl.db(booktoken, 'book');
                                let sql = `SELECT seriestitle,volumenumber,booktitle,booksubtitle,submitstatus,responsibleeditorid FROM book`;
                                var sqlSecAns = await CommomForBks(sql, db);
                                if (!_.isEmpty(sqlSecAns)) {
                                    await CallBackSplitForBks(booktoken, part_status, sqlSecAns, db);
                                } else {
                                    process.send({ counter: { status: 200, msg: 'No records in book table' } });
                                    /* close the database connection  */
                                    db.close();
                                    process.exit();

                                }
                            })();
                        })
                    }
                });
            }
        })
    })
}



function ChapterHtml(newPartMatter, book_no, fields, meta_chp_tmp, find_lang, xmlDoc, chapter_no, db, booktoken, part_status, dbtype, signalWriteFilePath, createToken, type) {
    var db = databaseurl.db(booktoken, dbtype);
    (async () => {
        // var DOMParser = require('xmldom').DOMParser;
        // var parser = new DOMParser();
        //  var xmlDoc = parser.parseFromString(meta_content, 'text/xml');
        //  var find_lang = xpath.select('//div[@class="Book"]', xmlDoc);

        var doc_chp_tmp = parser.parseFromString(meta_chp_tmp, 'text/xml');
        let sql = `SELECT seriestitle,volumenumber,booktitle,booksubtitle,submitstatus,responsibleeditorid,bookid,numrefstyle,sectionnumber FROM book`;
        let bk_db_d = await CommomForBks(sql, db)
        let t = await create_chap_tmp_file(newPartMatter, doc_chp_tmp, bk_db_d[0], fields.title);
        find_lang[0].appendChild(t);

        var temp_Newdbpath = url_port_details.tempDbPath + 'Query_ImageAnno.data';
        var new_locationdbpath = url_port_details.filePath + url_port_details[type] + book_no + '/' + chapter_no + '_Chapter/Query_ImageAnno.data';
        var uploadPath = url_port_details.filePath + url_port_details[type] + book_no + '/' + chapter_no + '_Chapter/upload';
        var imagesPath = url_port_details.filePath + url_port_details[type] + book_no + '/' + chapter_no + '_Chapter/images';
        await Create_chap_part(xmlDoc.toString(), temp_Newdbpath, new_locationdbpath, uploadPath, imagesPath, fields, booktoken, part_status, signalWriteFilePath, createToken, bk_db_d[0]);


    })();

}


// receive message from master process
process.on('message', async (message) => {
    await ForkAddPartChapter(message);
});