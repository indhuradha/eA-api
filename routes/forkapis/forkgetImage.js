

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
/* npm glob,path methods for services */
const fs = require('fs');


async function ForkGetHtml(payLoad) {
    try {
        var chapter_no = payLoad.payLoad[0].chapter_no;
        var book_no = payLoad.payLoad[0].book_no;
        var imageUploadDir = url_port_details.filePath + '/' + book_no + '/' + chapter_no + '/images/uploaded/'
        /* npm glob to get the html files from the filepath */
        if (fs.existsSync(imageUploadDir)) {
            fs.readdir(imageUploadDir, (err, files) => {
                if (err) {
                    process.send({ counter: { status: 400, msg: JSON.stringify(err) } });
                    process.exit();
                } else if (files.length == 0 || files[0] == undefined) {
                    process.send({ counter: { status: 400, msg: 'Specified File not Found' } });
                    process.exit();
                } else {
                    process.send({ counter: { status: 200, msg: files } });
                    process.exit();
                }
            })
        } else {
            process.send({ counter: { status: 400, msg: 'Image folder is not exits' } });
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
    await ForkGetHtml(message);
});