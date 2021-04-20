

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
var rp = require('request-promise');
/* npm xpath ,npm xmldom to load and traverse through the xml */
let xpath = require('xpath'), dom = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;

let xml2js = require('xml2js');
/*npm js2zmlparser to convert json to xml format */
let js2xmlparser = require("js2xmlparser");
/* Transfer the data  */
let http = require('http');
let httprequest = require('request');
var rp = require('request-promise');
let fun = require('../functions.js');
const utf8 = require('utf8');
const _ = require('lodash');


var bibTypeChildStaticArray = [{
    'bibarticle': ["bibauthorname", "etal", "year", "articletitle", "noarticletitle", "journaltitle", "volumeid", "issueid", "firstpage", "lastpage", 'bibarticlenumber', "bibarticledoi", "occurrence", "bibcomments"],
    'bibchapter': ['bibauthorname', 'authoretal', 'year', 'chaptertitle', 'nochaptertitle', 'bibeditorname', 'seriestitle', 'numberinseries', 'eds', 'editoretal', 'booktitle', 'editionnumber', 'confeventname', 'confseriesname', 'confeventabbreviation', 'confnumber', 'confeventlocation', 'confEventdate', 'confeventdatestart', 'confeventdateend', 'confeventurl', 'publishername', 'publisherlocation', 'firstpage', 'lastpage', 'bibchapterdoi', 'bibbookdoi', 'occurrence', 'ISBN', 'bibcomments'],
    'bibbook': ['bibauthorname', 'bibeditorname', 'etal', 'year', 'booktitle', 'editionnumber', 'confeventname', 'confferiesname', 'confeventabbreviation', 'confnumber', 'confeventlocation', 'confeventdat', 'confeventdatestart', 'confeventdateend', 'confeventurl', 'seriestitle', 'numberinseries', 'publishername', 'publisherlocation', 'firstpage', 'lastpage', 'bibbookdoi', 'occurrence', 'ISBN', 'bibcomments']
}]
var nobibtypeelement = [{
    'bibarticle': ['articletitle'],
    'bibchapter': ['chaptertitle']
}]

var errorOutput =
{
    "bibarticle": [{ "bibauthorname": [{ "initials": [{ "#": "" }], "familyname": [{ "#": "" }] }, { "institutionalauthorname": [{ "#": "" }] }], "etal": [{ "#": "no" }], "year": [{ "#": "" }], "articletitle": [{ "#": "", "@": { "language": "En" } }], "journaltitle": [{ "#": "" }], "volumeid": [{ "#": "" }], "issueid": [{ "#": "" }], "firstpage": [{ "#": "" }], "lastpage": [{ "#": "" }], "bibarticledoi": [{ "#": "" }], "bibcomments": [{ "#": "" }] }],
    "bibbook": [{ "bibauthorname": [{ "initials": [{ "#": "" }], "familyname": [{ "#": "" }] }, { "institutionalauthorname": [{ "#": "" }] }], "etal": [{ "#": "no" }], "year": [{ "#": "" }], "booktitle": [{ "#": "" }], "editionnumber": [{ "#": "" }], "publishername": [{ "#": "" }], "publisherlocation": [{ "#": "" }], "firstpage": [{ "#": "" }], "lastpage": [{ "#": "" }], "bibbookdoi": [{ "#": "" }], "bibcomments": [{ "#": "" }] }],
    "bibchapter": [{ "bibauthorname": [{ "initials": [{ "#": "" }], "familyname": [{ "#": "" }] }, { "institutionalauthorname": [{ "#": "" }] }], "authoretal": [{ "#": "no" }], "year": [{ "#": "" }], "chaptertitle": [{ "#": "", "@": { "language": "En" } }], "bibeditorname": [{ "initials": [{ "#": "" }], "familyname": [{ "#": "" }], "particle": [{ "#": "" }], "suffix": [{ "#": "" }] }, { "bibinstitutionaleditorName": [{ "#": "" }] }], "editoretal": [{ "#": "" }], "eds": [{ "#": "" }], "booktitle": [{ "#": "" }], "EditionNumber": [{ "#": "" }], "publishername": [{ "#": "" }], "publisherlocation": [{ "#": "" }], "firstpage": [{ "#": "" }], "lastpage": [{ "#": "" }], "bibchapterdoi": [{ "#": "" }], "bibcomments": [{ "#": "" }] }]
}


var journalKeys = ['person_name', 'year', 'title', 'full_title', 'volume', 'issue', 'first_page', 'last_page', 'doi'];
var camelCaseChange = {
    'person_name': 'bibauthorname',
    'year': 'year',
    'title': 'articletitle',
    'full_title': 'journaltitle',
    'volume': 'volumeid',
    'issue': 'issueid',
    'first_page': 'firstpage',
    'last_page': 'lastpage',
    'doi': 'bibarticledoi'
}



const options = {
    useSelfClosingTagIfEmpty: false,
    format: { doubleQuotes: true, pretty: false },
    declaration: { include: false }
}
var vfinalOpt = {

    'referenceDetails': '',
    'xmlDetails': '',
    "requestState": false
}

function Get_Crossref_Success_data(searchtype, xmlDoc) {
    if (searchtype == 'doi') {
        var doiyear = xpath.select('//journal/journal_issue/publication_date[@media_type="online"]/year|/publication_date[@media_type="print"]/year', xmlDoc)
    } else {

        var doiyear = xpath.select('//journal/journal_issue/publication_date/year', xmlDoc)
    }
    var bibAuthorChild =
    {
        'person_name': xpath.select('//journal/journal_article/contributors/person_name', xmlDoc),
        'year': doiyear,
        'title': xpath.select('//journal/journal_article/titles/title', xmlDoc),
        'full_title': xpath.select('//journal/journal_metadata/full_title', xmlDoc),
        'volume': xpath.select('//journal/journal_issue/journal_volume/volume', xmlDoc),
        'issue': xpath.select('//journal/journal_issue/issue', xmlDoc),
        'first_page': xpath.select('//journal/journal_article/pages/first_page', xmlDoc),
        'last_page': xpath.select('//journal/journal_article/pages/last_page', xmlDoc),
        'doi': xpath.select('//journal/journal_article/doi_data/doi', xmlDoc),
    }
    var bibStruct = xmlDoc.createElement("div");
    bibStruct.setAttribute("class", "BibStructured");
    var newBibType = xmlDoc.createElement('bibarticle');
    var unStruCnt = [];
    var authAndEditsubchild = ['surname', 'given_name'];
    for (let x = 0; x < journalKeys.length; x++) {
        for (let y = 0; y < bibAuthorChild[journalKeys[x]].length; y++) {
            const { nodeName, textContent, childNodes } = bibAuthorChild[journalKeys[x]][y];
            if (nodeName !== '#text') {
                var newBibAuthor = xmlDoc.createElement(camelCaseChange[nodeName]);
                for (let g = 0; g < authAndEditsubchild.length; g++) {
                    for (let h = 0; h < childNodes.length; h++) {
                        const { nodeName, textContent } = childNodes[h];
                        if (nodeName !== '#text' && 'affiliation' !== nodeName) {
                            if (nodeName == authAndEditsubchild[g]) {
                                if ('surname' == authAndEditsubchild[g]) {
                                    initialndfam = 'familyname';
                                    unStruCnt.push(textContent + ' ')
                                }
                                else if ('given_name' == authAndEditsubchild[g]) {
                                    initialndfam = 'initials';
                                    unStruCnt.push(textContent + '#')
                                }
                                var newInitialAndFam = xmlDoc.createElement(initialndfam);
                                var newInitialAndFamTxt = xmlDoc.createTextNode(textContent)
                                newInitialAndFam.appendChild(newInitialAndFamTxt);
                                newBibAuthor.appendChild(newInitialAndFam);
                            }
                        }
                    }
                }

                if (childNodes.length == 1) {
                    if (nodeName == 'first_page') {
                        unStruCnt.push(textContent + '-')
                    } else if (nodeName == 'issue' || nodeName == 'year') {
                        unStruCnt.push('(' + textContent + ') ')

                    } else if (nodeName == 'volume') {
                        unStruCnt.push(textContent)

                    } else if (nodeName == 'title') {
                        unStruCnt.push(textContent + '. ')

                    } else {
                        unStruCnt.push(textContent + ' ')

                    }
                    var newBibAuthortext = xmlDoc.createTextNode(textContent)
                    newBibAuthor.appendChild(newBibAuthortext);
                }
                newBibType.appendChild(newBibAuthor);
                bibStruct.appendChild(newBibType)
            }
        }
    }

    var strreplace = (unStruCnt.join()).replace(/,/g, "");
    var optUnStrCnt = '<div class="BibUnstructured">' + strreplace.replace(/#/g, ", ") + '</div>';
    var oSerializer = new XMLSerializer();
    var bibStrCnt = oSerializer.serializeToString(bibStruct);
    var finalOpt = {

        'referenceDetails': optUnStrCnt,
        'xmlDetails': bibStrCnt,
        "requestState": true
    }

    if (searchtype == 'doi') {
        process.send({ counter: { status: 200, msg: finalOpt } });
        process.exit();
    } else {
        httprequest.post(url_port_details.refRecal,
            {
                form:
                {
                    method: 'xmltojson',
                    content: bibStrCnt,
                },
                rejectUnauthorized: false,
            }, (error, res, body) => {
                if (error) {
                    console.error(error);
                    process.send({ counter: { status: 400, msg: JSON.stringify(error) } });
                    process.exit();
                }
                process.send({ counter: { status: 200, msg: body } });
                process.exit();
            })

    }

}

function CreateCrossref(content, searchtype, type, reftext) {

    var options = {
        'method': 'POST',
        'url': 'http://doi.crossref.org/servlet/query?usr=springer&pwd=crpw464&format=unixref&qdata=' + encodeURIComponent(content),
    };
    rp(options, function (error, data) {
        if (data !== undefined) {
            var DOMParser = require('xmldom').DOMParser;
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(data.body, 'text/xml');
            var AllCitation = xpath.select('//journal', xmlDoc);
            if (AllCitation.toString() == '') {
                if (searchtype == 'doi') {
                    process.send({ counter: { status: 200, msg: vfinalOpt } });
                    process.exit();
                } else {
                    process.send({ counter: { status: 300, msg: errorOutput } });
                    process.exit();
                }
            } else {

                Get_Crossref_Success_data(searchtype, xmlDoc);



            }
        } else {
            process.send({ counter: { status: 300, msg: errorOutput } });
            process.exit();

        }
    })
}

function Structure_XML(inputs, reftext) {
    var DataBibType = '';
    xml = inputs;
    var parseString = xml2js.parseString;
    var DOMParser = require('xmldom').DOMParser;
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xml, 'text/xml');

    for (var g = 0; g < xmlDoc.documentElement.childNodes.length; g++) {
        const { nodeName, childNodes } = xmlDoc.documentElement.childNodes[g];
        if ("#text" !== nodeName) {
            for (var m = 0; m < childNodes.length; m++) {
                const { nodeName, textContent } = childNodes[m];
                /* To create Parent tag(bibauthor,bibeditor) for institutional tag */
                if (childNodes[m].toString().includes("institutional")) {
                    if ('institutionalauthorname' === nodeName) {
                        var newbibauthandedit= xmlDoc.createElement('bibauthorname');
                    } else if ('bibinstitutionaleditorname' === nodeName) {
                        var newbibauthandedit = xmlDoc.createElement('bibeditorname');
                    }
                    var newInstitutionalchild = xmlDoc.createElement(nodeName);
                    var newInstitutionalchildtext = xmlDoc.createTextNode(textContent)
                    newInstitutionalchild.appendChild(newInstitutionalchildtext);
                    newbibauthandedit.appendChild(newInstitutionalchild);
                    xmlDoc.documentElement.childNodes[g].replaceChild(newbibauthandedit, childNodes[m]);
                }
                /* To change noinitials to initials */
                else
                    if (childNodes[m].toString().includes("noinitials")) {
                        for (let k = 0; k < childNodes[m].childNodes.length; k++) {
                            const { nodeName, textContent } = childNodes[m].childNodes[k];
                            if (nodeName !== "#text") {
                                if (nodeName === 'noinitials') {
                                    var newNoIntials = xmlDoc.createElement('initials');
                                } else {
                                    var newNoIntials = xmlDoc.createElement(nodeName);

                                }
                                var textNode = xmlDoc.createTextNode(textContent);
                                newNoIntials.appendChild(textNode);
                                childNodes[m].replaceChild(newNoIntials, childNodes[m].childNodes[k]);

                            }

                        }
                    }
                    /* To change noinitials to initials */
                    /* escape these (articletitle|journaltitle|chaptertitle|booktitle)  tag */
                    else if (_.includes(nodeName, 'title') && (!_.includes(nodeName, 'no'))) {
                        content = (childNodes[m]).toString()
                        content = content.replace(/\<(articletitle|journaltitle|chaptertitle|booktitle|datasettitle)[^>]*\>/g, "");
                        content = content.replace(/\<\/(articletitle|journaltitle|chaptertitle|booktitle|datasettitle)\>/g, "");
                        var textNode = xmlDoc.createTextNode(content);
                        var newartciletitle = xmlDoc.createElement(nodeName);
                        newartciletitle.appendChild(textNode);
                        xmlDoc.replaceChild(newartciletitle, childNodes[m]);
                    }
                /* escape these (articletitle|journaltitle|chaptertitle|booktitle)  tag */
                /* Tag name changes etal to authoretal or editoretal */

            }

        }
    }
    var oSerializer = new XMLSerializer();
    var xmlToJsonOpt = oSerializer.serializeToString(xmlDoc);
    // /* convert xml to json using JsonParser */
    parseString(xmlToJsonOpt, {
        attrkey: '@',
        explicitArray: true, pretty: false,
        explicitCharkey: true, trim: true, charkey: '#', emptyTag: { "#": '' },
        // attrkey: '@', preserveChildrenOrder: true, mergeAttrs: false, ignoreAttrs: false, charsAsChildren: true,
        // valueProcesser: [fun.replaceTag], explicitRoot: true
    }, function (err, convertopt) {
        if (convertopt !== undefined) {
            if (convertopt.div !== undefined) {
                convertopt[DataBibType] = convertopt.div;
                delete convertopt[DataBibType]['@']
                delete convertopt.div
            }
            if (err) {
                process.send({ counter: { status: 404, msg: JSON.stringify(err) } });
            }
            process.send({ counter: { status: 200, msg: convertopt[DataBibType] } });

        } else {
            process.send({ counter: { status: 400, msg: 'Cannot convert xml to json ' } });

        }

    })

    ///////////convert json end////////////////////////////

}
function Structure_JSON(inputs, reftext) {
    var authAndEditsubchild = ['familyname', 'initials', 'particle', 'suffix']
    //  var dynamicbibtype = '';
    var stringToJson = JSON.parse(inputs);
    /* Get bibtype keys  */
    var parentBibType = Object.keys(stringToJson);
    /* Get bibtype  */
    const dynamicbibtype = parentBibType[parentBibType.length - 1];

    for (let h = 0; h < nobibtypeelement.length; h++) {
        if (_.get(nobibtypeelement[h][dynamicbibtype], 'length', false)) {
            for (let n = 0; n < nobibtypeelement[h][dynamicbibtype].length; n++) {
                var checkwithoutkey = nobibtypeelement[h][dynamicbibtype][n];
                if (stringToJson[dynamicbibtype][0][checkwithoutkey] === undefined) {
                    stringToJson[dynamicbibtype][0]['no' + checkwithoutkey] = [{ '#': '' }]
                } else {
                    stringToJson[dynamicbibtype][0][checkwithoutkey] = [{ "@": { "Language": "En" }, '#': stringToJson[dynamicbibtype][0][checkwithoutkey][0]['#'] }]

                }
            }
        }

    }

    var jsontoxml = js2xmlparser.parse(dynamicbibtype, stringToJson[dynamicbibtype][0], options);
    var doc = new dom().parseFromString(jsontoxml);
    var newCitation = doc.createElement(dynamicbibtype);
    // /* Sorting BibType's Child & Subchilds */
    //  var unStruCnt = [];
    for (x = 0; x < bibTypeChildStaticArray.length; x++) {
        for (let z = 0; z < bibTypeChildStaticArray[x][dynamicbibtype].length; z++) {
            var nodes = xpath.select("/" + dynamicbibtype + "/" + bibTypeChildStaticArray[x][dynamicbibtype][z], doc);
            for (i = 0; i < nodes.length; i++) {
                if (nodes[i].toString().includes("institutional")) {
                    newCitation.appendChild(nodes[i].firstChild);
                } else if (nodes[i].toString().includes("familyname")) {
                    var keys = i + 1;
                    var NewBibSubChild = doc.createElement(nodes[i].nodeName)
                    for (let g = 0; g < authAndEditsubchild.length; g++) {
                        var subNodes = xpath.select("//" + dynamicbibtype + "/" + nodes[i].nodeName + "[" + keys + "]/" + authAndEditsubchild[g], doc);
                        for (let h = 0; h < subNodes.length; h++) {
                            if (subNodes[h].textContent === '') {
                                var noinitialsnode = doc.createElement('no' + subNodes[h].nodeName);
                                NewBibSubChild.appendChild(noinitialsnode)
                            } else {
                                NewBibSubChild.appendChild(subNodes[h])
                            }
                        }
                    }
                    newCitation.appendChild(NewBibSubChild);
                }
                else {
                    if (nodes[i].nodeName == 'etal' || nodes[i].nodeName === 'authoretal' || nodes[i].nodeName === 'editoretal') {

                        if (nodes[i].textContent !== 'no') {
                            var etalNode = doc.createElement('etal');
                            var etalText = doc.createTextNode(' ');
                            etalNode.appendChild(etalText)
                            newCitation.appendChild(etalNode);
                        }
                    }
                    else {
                        newCitation.appendChild(nodes[i]);
                    }
                }
            }
        }
    }
    // /* Sorting BibType's Child & Subchilds */

    var oSerializer = new XMLSerializer();
    var newCitation = oSerializer.serializeToString(newCitation);
    var doc = new dom().parseFromString(newCitation.toString());

    // var strreplace = (unStruCnt.join()).replace(/,/g, "");
    var bibStruct = doc.createElement("div");
    bibStruct.setAttribute("class", "BibStructured");
    var unbibStruct = doc.createElement("div");
    unbibStruct.setAttribute("class", "BibUnstructured");
    var Spandoi = doc.createTextNode(reftext);
    bibStruct.appendChild(doc);
    unbibStruct.appendChild(Spandoi)
    // bibStruct.appendChild(unbibStruct);
    var citecsloptdom = new dom().parseFromString(bibStruct.toString());

    var changeElement = ['noinitials', 'etal', 'eds', 'noarticletitle', 'nochaptertitle'];
    /* Sorting bibtype's subchilds */
    for (x = 0; x < changeElement.length; x++) {
        var nodes = xpath.select("//" + changeElement[x], citecsloptdom);
        for (i = 0; i < nodes.length; i++) {
            var textElement = citecsloptdom.createTextNode(" ");
            nodes[i].appendChild(textElement);
        }

    }
    process.send({ counter: { status: 200, msg: citecsloptdom.toString() + unbibStruct.toString() } });
    process.exit();
    /* Rename lowercase to camelcase */

}
async function ForkReference(input) {
    var searchtype = input.searchtype;
    var reftext = input.reftext;
    var inputs = input.content;
    var method = input.method;
    var type = input.type;
    var content = '';
    if (searchtype == 'doi') {
        content += '<?xml version = "1.0" encoding="UTF-8"?>'
        content += '<query_batch xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.0" '
        content += 'xmlns="http://www.crossref.org/qschema/2.0" xsi:schemaLocati'
        content += 'on="http://www.crossref.org/qschema/2.0 http://www.crossref.org/qschema/crossref_query_input2.0.xsd">'
        content += '<head><email_address>jgayathri@sps.co.in</email_address><doi_batch_id>25423871</doi_batch_id></head><body>'
        content += '<query key="mykey" expanded-results="true"><doi>' + reftext + '</doi></query></body></query_batch>'

        CreateCrossref(content, searchtype, type, reftext)

    } else {



        if (method == 'xmltojson') {
            try {

                Structure_XML(inputs, reftext);
            }
            catch (err) {
                process.send({ counter: { status: 200, msg: 'error' } });
            }
        }
        else if (method == 'jsontoxml') {
            try {

                Structure_JSON(inputs, reftext);

            }
            catch (error) {
                console.error("problem with request: " + error);
                process.send({ counter: { status: 404, msg: "error" } });
            }

        } else if (method == 'bibunstructured') {
            try {
                content += '<?xml version = "1.0" encoding="UTF-8"?><query_batch xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.0" xmlns="http://www.crossref.org/qschema/2.0" xsi:schemaLocation="http://www.crossref.org/qschema/2.0 http://www.crossref.org/qschema/crossref_query_input2.0.xsd"><head><email_address>your@email.org</email_address><doi_batch_id>01032012</doi_batch_id></head><body><query key="q1" enable-multiple-hits="true"><unstructured_citation>' + reftext + '</unstructured_citation></query></body></query_batch>'

                CreateCrossref(content, searchtype, type, reftext)
            }
            catch (error) {

                console.error("problem with request: " + error);
                process.send({ counter: { status: 404, msg: "error" } });
            }
        }
        else {
            process.send({ counter: { status: 400, msg: JSON.stringify({ 'ErrorCode': 'Unsupported request argument' }) } });
            process.exit();
        }
    }
}


// receive message from master process
process.on('message', async (message) => {
    await ForkReference(message);
});


