

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
var url_port_details = require('../url_port_details');
var databaseurl = require(url_port_details.dbPath + 'db');
/*token.js to get the decrypted data from the token */
let jwtToken = require('../token.js');
/* npm glob,path methods for services */
let glob = require('glob');
let fs = require('fs');
var d = new Date().toString();
var index = d.lastIndexOf(':') + 3;
var finalD = d.substring(0, index);
const preprocessor = require('../utils/processor');

function ChapterDBUpdate(db, val, sql) {
    return new Promise(function (resolve, reject) {
        db.run(sql, val, function (err, data) {
            resolve(data);
        })
    })

}


async function MailSending(mailOptions, signalWriteFilePath, type, dataFolderPath) {

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        port: 25,
        host: 'localhost',
        tls: {
            rejectUnauthorized: false
        },
    });



    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("failed to mail sending")
            var logcnt = finalD + ' Confirmation Mail to author is not send to author mail id  ' + finalD
        }
        else {
            console.log("sucessfully to mail sending")
            var logcnt = finalD + ' Confirmation Mail to author is send to author mail id  ' + finalD
        }
        (async () => {
            var signalWriteFilePath = dataFolderPath.dataFolder_book + '/log.txt';
            let data_LogFile = await preProcessCreateLogFile(logcnt, dataFolderPath, signalWriteFilePath);
            var to_production = url_port_details.filePath + url_port_details[type] + 'to_production/' + dataFolderPath.jnls_bks_no + '_submitted.txt';
            if (!fs.existsSync(url_port_details.filePath + url_port_details[type] + 'to_production/')) {
                fs.mkdirSync(url_port_details.filePath + url_port_details[type] + 'to_production/');
            }
            fs.writeFile(to_production, '', function (err) {
                console.log(err)
                process.send({ counter: { status: 200, msg: data_LogFile } });
                process.exit();
            })
        })();
    });
}


async function ForkSendMail(dataFolderPath, input, db) {
    var type = input.type;
    let Developer_email = url_port_details.Developer_email;
    let Admin_email = url_port_details.Admin_email;


    var signalWriteFilePath = dataFolderPath.dataFolder_book + 'log.txt';

    db.all("SELECT authormailid, bookid FROM book", (err, val) => {
        var Authormailid = Admin_email;
        if (val != undefined) {
            Authormailid = val[0].authormailid;
            var bookid = val[0].bookid;
        }

        let Add_MessageContent = 'Confirmation mail for ' + bookid + ' Correction Submitted';
        let Authormsg_content = 'Your book has been submitted successfully'
        let author_message = 'Dear Author,<br />' + Authormsg_content + '</p><p style="font:12px arial,sans-serif; color: #333; padding: 5px;">Regards.<br />Springer Team</p>';
        var mailOptions = {
            from: 'gayathri.jayakumar@springernature.com',
            to: Authormailid,
            // to: Developer_email + ';' +durga+ ';' + abinayak+ ';' +abinayakn+ ';' +gajalakshmi,
            bcc: Developer_email + ';' + Admin_email,
            subject: Add_MessageContent,
            html: author_message,
        };
        MailSending(mailOptions, signalWriteFilePath, type, dataFolderPath);// let logcnt = finalD + ' Book has been SUBMITTED to proof   ' + finalD;

    })

}

function updatechapterdb(files, book_no, vloop, dataFolderPath, input, bookdb) {
    if (files[vloop] !== undefined) {
        if (files[vloop].includes("_Chapter") == true || files[vloop].includes("_PartFrontMatter")) {
            let chapter_no = files[vloop].split('/')[(files[vloop].split('/')).length - 1];
            newToken = { 'book_no': book_no, 'chapter_no': chapter_no, 'type': 'bks' };
            var createToken = jwtToken.getEncrypt(newToken);
            var db = databaseurl.db(createToken, 'chapter');
            let val3 = [0];
            let sql3 = `UPDATE chapter
            SET  submitstatus = ?`;
            db.run(sql3, val3, function (err, data) {
                if (err) {
                    process.send({ counter: err.message });
                } else {
                    if (files.length > vloop) {
                        vloop++;
                        updatechapterdb(files, book_no, vloop, dataFolderPath, input, bookdb)
                    }
                }
            })

        } else {
            if (files.length > vloop) {
                vloop++;
                updatechapterdb(files, book_no, vloop, dataFolderPath, input, bookdb)

            }

        }
    }


    if (files.length == vloop) {
        (async () => {
            await ForkSendMail(dataFolderPath, input, bookdb);

        })();
    }
}

async function preProcessCreateLogFile(s_c, LogFile, signalWriteFilePath) {
    return new Promise(function (resolve, reject) {
       if (!fs.existsSync(LogFile.dataFolderPath)) {
            fs.mkdirSync(LogFile.dataFolderPath);
        }

        if (!fs.existsSync(signalWriteFilePath)) {
            fs.writeFile(signalWriteFilePath, s_c, function (err) {
                resolve(LogFile.dataFolderPath);
            })
        }
        else {
            fs.readFile(signalWriteFilePath, { encoding: 'utf-8' }, function (err, htlm_cnt) {
                fs.writeFile(signalWriteFilePath, htlm_cnt + '\n' + s_c, function (err) {
                    resolve(LogFile.dataFolderPath);
                })
            })
        }
    })
}

async function ForkSubmitChapter(input) {
    try {
        const dataFolderPath = await preprocessor.preProcessGetDataFolder(input);

        var book_no = dataFolderPath.jnls_bks_no;
        var signalWriteFolder = dataFolderPath.dataFolderPath;
        var signalWriteFilePath = signalWriteFolder + 'log.txt'

        if (input.dbtype == 'chapter') {
            var db = databaseurl.db(input.token, input.dbtype);
            var correctionUpd = '';
            if (input.correction == true) {
                correctionUpd = 0;
            } else {
                correctionUpd = 1;
            }
            let val = [0, correctionUpd];
            let sql = `UPDATE chapter SET  submitstatus = ?, nocorrection = ?`;
            await ChapterDBUpdate(db, val, sql);
            let vals = [0, input.token];
            let sqls = `UPDATE chapter SET chapterstatus = ? WHERE token = ?`;
            var db = databaseurl.db(input.token, 'book');
            await ChapterDBUpdate(db, vals, sqls);
            let logcnt = finalD + ' Chapter SUBMITTED at  ' + finalD;
            let signalWriteFilePath = `${dataFolderPath.dataFolderPath}${'log.txt'}`;
            let data_LogFile = await preProcessCreateLogFile(logcnt, dataFolderPath, signalWriteFilePath);
            process.send({ counter: { status: 200, msg: data_LogFile } });
            process.exit();

        } else if (input.dbtype == 'jnls') {

            var db = databaseurl.db(input.token, 'jnls');
            let vals = [0];
            let sqls = `UPDATE article SET  submitstatus = ?`;
            await ChapterDBUpdate(db, vals, sqls);
            let logcnt = finalD + ' Article SUBMITTED at  ' + finalD;
            let signalWriteFilePath = `${dataFolderPath.dataFolderPath}${'log.txt'}`;
            let data_LogFile = await preProcessCreateLogFile(logcnt, dataFolderPath, signalWriteFilePath);
            process.send({ counter: { status: 200, msg: data_LogFile } });
            process.exit();

        } else {
            var db = databaseurl.db(input.token, 'book');
            let vals = [0, 0];
            let sqls = `UPDATE book SET  submitstatus = ?, pestatus = ?`;
            await ChapterDBUpdate(db, vals, sqls);
            let val = [0];
            let sql = `UPDATE chapter SET  chapterstatus = ?`;
            await ChapterDBUpdate(db, val, sql);
            glob(url_port_details.filePath + '/' + book_no + "/*", {}, (err, files) => {
                updatechapterdb(files, book_no, 0, dataFolderPath, input, db);
            })
        }

    }
    catch (error) {
        console.log(error)
        process.send({ counter: { status: 400, msg: error } });
        process.exit();
    }
}

// receive message from master process
process.on('message', async (message) => {
    await ForkSubmitChapter(message);
});