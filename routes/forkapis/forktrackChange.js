
/*START#############################################
#
#  Purpose  : Reads the token from the request and reads the HTML file and ORG file  from the filepath and sends changed html file  in the response using daisy diff jar
#
#  Author   : Indhumathi R
#
#  Client   : SPS
#
#  Project  : E-authoring
#
#  Date     : July 15, 2020
#
END ###############################################*/

/* npm glob,path methods for services */
let glob = require('glob');
var fs = require('fs');
/* To get the current date */
var date = new Date();
var year = date.getFullYear();
/*To get the value of other server url details*/
let url_port_details = require('../url_port_details');
/* Method which is called from function.js file  */
var process = require("process")
/*child_process exec method to  execute the java command */
var exec = require('child_process').exec;
const preprocessor = require('../utils/processor');

var exec = require('child_process').exec;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function uniqueID() {
    return Math.floor(Math.random() * new Date().getTime()).toString(16);
}

function removeDir(path) {
    if (fs.existsSync(path)) {
        const files = fs.readdirSync(path)
        if (files.length > 0) {
            files.forEach(function (filename) {
                if (fs.statSync(path + "/" + filename).isDirectory()) {
                    removeDir(path + "/" + filename);
                } else {
                    fs.unlinkSync(path + "/" + filename)
                }
            })
            fs.rmdirSync(path)
        } else {
            fs.rmdirSync(path)
        }
    }
}


async function ForkTrackChange(payLoad) {
    try {
        var type = payLoad.type;

        const dataFolderPath = await preprocessor.preProcessGetDataFolder(payLoad);
        /*Filepath to retrieve the html files from the path*/
        // /* npm glob to get the html.org files from the filepath */
        var difffilename = dataFolderPath.dataFilePath.split('.')[0] + '_diff';
        let html_file_path = dataFolderPath.dataFilePath;
        let org_file_path = dataFolderPath.dataFilePath + '.org';

        if (fs.existsSync(org_file_path)) {
            fs.readFile(org_file_path, { encoding: 'utf-8' }, function (err, org_content) {
                var actualHTML = org_content;

                if (fs.existsSync(html_file_path)) {
                    fs.readFile(html_file_path, { encoding: 'utf-8' }, function (err, html_content) {
                        var expectedHTML = html_content;
                        (async () => {
                            var tempPath = url_port_details.filePath + url_port_details[type] + "temp/" + uniqueID() + "/";
                            fs.mkdirSync(tempPath, { recursive: true })
                            try {
                                await removescriptTag(expectedHTML, "new");
                                await removescriptTag(actualHTML, "old")
                            } catch {
                                removeDir(tempPath);
                                return;
                            }

                            /*daisydiff jar file filepath*/
                           // let jarFile = url_port_details.filePath + url_port_details[type] + 'daisydiff.jar';
                            /*Java compiler command to execute daisy diff*/
                            var compileit = 'java -jar ' + ' ' + url_port_details.trackChange + ' ' + tempPath + "old_processed.html" + ' ' + tempPath + "new_processed.html" + ' ' + '--file=' + difffilename + '.html';
                            /*Childprocess exec method to execute the java command and save the changed html file in the filepath*/
                            exec(compileit, { windowsHide: true }, function (error, stdout, stderr) {                                
                                removeDir(tempPath);
                                if (fs.existsSync(difffilename + '.html')) {

                                    process.send({ counter: { status: 200, msg: difffilename + '.html' } });
                                    process.exit();
                                } else {
                                    process.send({ counter: { status: 400, msg: 'diff file is not created' } });
                                    process.exit();

                                }
                            });



                            function removescriptTag(HTMLContent, type) {
                                return new Promise((r, re) => {
                                    var dom = new JSDOM(HTMLContent)
                                    dom.window.document.querySelectorAll("[name='EquationSource']").forEach(e => {
                                        if (e.getAttribute("format") == "TEX") {
                                            var scriptTag = e.getElementsByTagName('script');
                                            if (scriptTag.length > 0) {
                                                var script = scriptTag.item("script");
                                                var trimmed = script.textContent.replace("<![CDATA[", "").replace("]]>", "");
                                                var divElm = dom.window.document.createElement("div");
                                                var textnode = dom.window.document.createTextNode(trimmed);
                                                divElm.appendChild(textnode);
                                                e.appendChild(divElm)
                                                script.remove();
                                            }
                                        } else {
                                            e.remove();
                                        }
                                    });
                                    fs.writeFile(tempPath + type + "_processed.html", dom.serialize(), function (err) {
                                        if (err) {
                                            re()
                                        } else {
                                            r()
                                        }
                                    });
                                });
                            }



                        })();
                    })

                } else {
                    process.send({ counter: { status: 400, msg: 'html file is not exists in the filepath' } });
                }
            })
        } else {
            process.send({ counter: { status: 400, msg: 'html.org file is not exists in the filepath' } });
        }
    }
    catch (error) {
        process.send({ counter: { status: 400, msg: error } });
        process.exit();
    }
}

// receive message from master process
process.on('message', async (message) => {
    await ForkTrackChange(message);

});