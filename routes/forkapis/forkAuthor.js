/*npm js2xmlparser to convert json to xml format */
let js2xmlparser = require("js2xmlparser");

/*npm xml2js to convert xml to json format*/
let xml2js = require('xml2js');



async function sendMultipleXml(message) {
    var method = message.method;
    let content = message.content;
    /* If token is xmltojson which converts the input xml format to json format */
    if (method == 'xmltojson') {

        try {
            /*Input XML content*/
            var data = content
            data = data.replace(/nogivenname/g, 'givenname');
            /*Function to convert input XML to JSON*/
            xml2js.parseString(data, {
                explicitArray: true, explicitCharkey: true, trim: true, charkey: '#', emptyTag: { "#": '' },
                attrkey: '@', preserveChildrenOrder: true, mergeAttrs: false, ignoreAttrs: false, charsAsChildren: true,
                explicitRoot: true
            }, (err, res) => {
                if (err) {
                    process.send({ counter: { status: 400, msg: JSON.stringify(err) } });
                    process.exit();
                    // return  JSON.stringify(err);
                }
                let jsonres = JSON.stringify(res);
                process.send({ counter: { status: 200, msg: jsonres } });
                process.exit();
            });
        }
        catch (error) {
            process.send({ counter: { status: 400, msg: error } });
            process.exit();
        }
    }
    else if (method == 'jsontoxml') {
        try {

            /*Input JSON content*/
            var data = JSON.parse(content);

            /* If input JSON has Author*/
            if (data.author) {

                data.author.authorname.forEach(element => {
                    if (element.givenname == undefined) {
                        data.author.authorname = Object.assign({ givenname: [{ "#": "" }] }, element);
                    }
                });
            } else if (data.institutionalauthor) { /*If input JSON has institutionalauthor*/
                if (data.institutionalauthor.author !== undefined) {
                    data.institutionalauthor.author.forEach(element => {
                        if (element.authorname.givenname == undefined) {
                            element.authorname.forEach(element2 => {
                                element.authorname = Object.assign({ givenname: [{ "#": "" }] }, element2);
                            })
                        }
                    });
                }
            }
            /*NPM js2xmlparser to convert jsontoxml*/
            var xml = js2xmlparser.parse('sample', data, { useSelfClosingTagIfEmpty: false, format: { doubleQuotes: true }, declaration: { include: false } });
            xml = xml.replace("\n", '');
            xml = xml.replace('<sample>', '');
            xml = xml.replace('</sample>', '');
            xml = xml.replace('<contact/>', '<contact></contact>');
            xml = xml.replace(/<givenname><\/givenname>/, '<nogivenname> </nogivenname>');
            process.send({ counter: { status: 200, msg: xml.trim() } });
            process.exit();
        }
        catch (error) {
            console.log(error);
            process.send({ counter: { status: 400, msg: error } });
            process.exit();
        }
    }
    else {
        process.send({ counter: { status: 400, msg: 'Unsupported request argument' } });
        process.exit();
    }
}


process.on('message', async (message) => {
    await sendMultipleXml(message);
});