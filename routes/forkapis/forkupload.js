

/*START#############################################
#  $Revision: 1.0 $
#
#  Purpose  :Fork method for compliation.
#
#  Author   : Indhumathi R
#
#  Client   : Latex
#
#  Date     : Mar 10, 2020
#
######################################################################END*/

/*To get the value of other server url details*/
let url_port_details = require('../url_port_details');
const fs = require('fs');
let glob = require('glob');
const path = require('path');
const preprocessor = require('../utils/processor');

function CopyFile(temp_path, new_location, fs, sucessmsg) {
    return new Promise(function (resolve, reject) {
        fs.copy(temp_path, new_location, function (err) {
            resolve(sucessmsg)
        })
    })

}

async function Upload(inputs) {
    /*To get the payload from the token*/
    if (inputs.method == 'post') {
        var folderType = inputs.fields.folderType;

        if (folderType === 'insertimage') {
            var img_eman = inputs.fields.name;
            var fig = inputs.fields.fig;
            var extension_img = inputs.fields.extension;
        } else {
            /* Temporary location of our uploaded file */
            var temp_path = inputs.files.file.path;
            /* The file name of the uploaded file */
            var file_name = inputs.files.file.name;

        }
    }

    const dataFolderPath = await preprocessor.preProcessGetDataFolder(inputs);
    var bkschapfilepath = dataFolderPath.dataFolderPath;
    /* Location where we want to copy the uploaded file */
    var imageUploadDir = bkschapfilepath + 'images/uploaded/'
    if (inputs.method == 'post') {
        const fs = require('fs-extra');
        if (folderType === 'uploadimage') {
            const new_location = path.join(imageUploadDir);
            if (!fs.existsSync(new_location)) {
                fs.mkdirSync(new_location);
            }
            if (!fs.existsSync(imageUploadDir + file_name)) {
                let sucessmsg = 'Image upload is successfully created';
                await CopyFile(temp_path, new_location + file_name, fs, sucessmsg);
                process.send({ counter: { status: 200, msg: sucessmsg } });
                process.exit();
            } else {
                process.send({ counter: { status: 400, msg: 'Image file is already existing' } });
                process.exit();

            }

        } else if (folderType === 'uploadtable') {
            var tableImageDir = bkschapfilepath + 'images/'
            var tableRenameDir = tableImageDir + 'Table_' + file_name;
            if (!fs.existsSync(tableImageDir + file_name)) {
                let sucessmsg = 'Image upload is successfully created';
                await CopyFile(temp_path, tableRenameDir, fs, sucessmsg);
                process.send({ counter: { status: 200, msg: 'Table_' + file_name } });
                process.exit();
            } else {
                process.send({ counter: { status: 200, msg: 'Table Image file is already existing' } });
                process.exit();
            }

        } else if (folderType === 'upload') {
            var uplaadDir = bkschapfilepath + 'upload/';
            var tableRenameDir = uplaadDir + file_name;
            if (!fs.existsSync(uplaadDir + file_name)) {
                let sucessmsg = "uploaded file is created";
                await CopyFile(temp_path, tableRenameDir, fs, sucessmsg);
                process.send({ counter: { status: 200, msg: sucessmsg } });
                process.exit();
            } else {
                fs.unlinkSync(tableRenameDir);
                let sucessmsg = "uploaded file is created";
                await CopyFile(temp_path, tableRenameDir, fs, sucessmsg);
                process.send({ counter: { status: 200, msg: sucessmsg } });
                process.exit();
            }
        } else {
            var newPath = imageUploadDir + img_eman;
            var writeImagedir = bkschapfilepath + 'images/';
            if (inputs.type == 'jnls') {
                var splitchapter_no = inputs.art_no;

            } else {
                var splitchapter_no = inputs.chapter_no.split('_');

            }
            var updatedFilename = writeImagedir + '' + inputs.book_no + '_' + splitchapter_no[0] + '_' + fig + '_HTML.' + extension_img;
            if (fs.existsSync(newPath)) {
                /* npm glob to get the html files from the filepath */
                fs.move(newPath, writeImagedir + img_eman, err => {
                    if (err) {
                        process.send({ counter: { status: 400, msg: "error in copying image file" } });
                        process.exit();
                    } else {
                        if (fs.existsSync(writeImagedir + img_eman)) {
                            if (fs.existsSync(updatedFilename)) {
                                fs.unlinkSync(updatedFilename);
                            }
                            fs.renameSync(writeImagedir + img_eman, updatedFilename);
                            /* npm glob to get the html files from the filepath */
                            if (fs.existsSync(updatedFilename)) {
                                glob(updatedFilename, {}, (err, files) => {
                                    var splitRenameFile = files[0].split('/');
                                    process.send({ counter: { status: 200, msg: splitRenameFile[splitRenameFile.length - 1] } });
                                })
                            } else {
                                process.send({ counter: { status: 400, msg: 'Specific file is not found' } });
                                process.exit();
                            }
                        } else {
                            process.send({ counter: { status: 400, msg: 'rename file is not found' } });
                            process.exit();

                        }
                    }
                });
            } else {
                process.send({ counter: { status: 400, msg: 'Specified File not Found' } });
                process.exit();
            }

        }

    } else {
        /* npm glob to get the html files from the filepath */
        if (fs.existsSync(imageUploadDir)) {
            fs.readdir(imageUploadDir, (err, files) => {
                if (err) {
                    process.send({ counter: { status: 400, msg: err } });
                    process.exit();
                } else if (files.length == 0 || files == undefined) {
                    process.send({ counter: { status: 200, msg: [] } });
                    process.exit();
                } else {
                    process.send({ counter: { status: 200, msg: files } });
                    process.exit();
                }
            })
        } else {
            process.send({ counter: { status: 400, msg: 'Uploaded folder not Found' } });
            process.exit();

        }

    }
}

// receive message from master process
process.on('message', async (message) => {

    await Upload(message);

});