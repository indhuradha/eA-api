

/*START#############################################
#
#  Purpose  : to check for spelling in the html file using language tool and send the corrected spelling in response
#
#  Author   : Indhumathi
#
#  Client   : SPS
#
#  Date     : 22 May 2020
#
*/
/*npm http for connecting with another endpoint*/
/*Function to get the unique values*/
/* npm j2xmlparser which converts json to xml format */
let js2xmlparser = require("js2xmlparser");

/* npm xml2js which converts xml to json format */
let xml2js = require('xml2js');

/* npm fs for file reading and file writing operations in service */
const fs = require('fs');


/*To get the value of other server url details*/
let url_port_details = require('../url_port_details');

let fun = require('../functions');
/* npm xmldom to load and traverse through the xml */
let dom = require('xmldom').DOMParser;

let rp = require('request-promise');

async function sendMultipleXml(message) {
	var method = message.method;
	var content = message.content;
	var id = message.id;
	/*If method from the request is xmltojson*/
	if (method === 'xmltojson') {
		try {
			/*Function to convert input XML to JSON*/
			let resfromfun = fun.affiAuthorxmltojson(method, url_port_details.node_env, content, "affiliation")
			process.send({ counter: { status: 200, msg: resfromfun } });
			process.exit();
		}
		/* error occurs from the try block */
		catch (err) {
			process.send({ counter: { status: 400, msg: "error" } });
			process.exit();
		}
	}
	/*If method from the request is jsontoxml*/
	else if (method === 'jsontoxml') {
		try {

			/*Input JSON content*/
			var data = JSON.parse(content);

			/* To get the CountryCode from CountryName*/
			if (data.affiliation.orgaddress !== undefined) {
				var countryName = data.affiliation.orgaddress[0].country[0]['#'];
				var jsondata = fs.readFileSync(__dirname + '/countrycode.json');
				let parsedjsondata = JSON.parse(jsondata);
				for (var i = 0; i < parsedjsondata.CountryNameandCode.length; i++) {
					if (parsedjsondata.CountryNameandCode[i].CountryName.toUpperCase() == countryName.toUpperCase()) {
						data.affiliation.orgaddress[0].country[0]['@'] = { "code": parsedjsondata.CountryNameandCode[i].CountryCode }
						break;
					}
				}
			}

			/*NPM js2xmlparser to convert jsontoxml*/
			var xml = js2xmlparser.parse('sample', data, { useSelfClosingTagIfEmpty: false, format: { doubleQuotes: true, pretty: true }, declaration: { include: false } });

			/*convert the xml to dom structure*/
			var doc = new dom().parseFromString(xml);

			/*to get the child nodes from the xml and exclude the sample tag */
			var nodes = doc.documentElement.childNodes;
			process.send({ counter: { status: 200, msg: nodes.toString() } });
			process.exit();
		}
		/* error occurs from the try block */
		catch (error) {
			process.send({ counter: { status: 400, msg: "error" } });
			process.exit();
		}
	} else if (method == "processaffiliation") { /*If method is processaffiliation*/
		if (content == undefined || content == '') { /*If content is undefined*/
			process.send({ counter: { status: 400, msg: "Please send the valid input content" } });
			process.exit();
		} else if (id == undefined || id == '') {/*If id is undefined*/
			process.send({ counter: { status: 400, msg: "Please send the valid affiliation ID" } });
			process.exit();
		} else {
			let options = {
				'method': 'POST',
				'url': url_port_details.processAffliation,
				'headers': {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				form: {
					'affiliations': content
				}
			};
			/*Connecting to Process Affiliation server to get the XML affiliation response*/
			rp(options, function (error, processaffliationresponse) {
				if (error) { /*If error from Process Affiliation Server*/
					process.send({ counter: { status: 400, msg: "Please check with process affiliation server" } });
				} else { /*If response from process affiliation server */
					try {
						/*Sending to NODI- xmltojson affiliation service to get the JSON format*/
						let responsefromxmltojson = fun.affiAuthorxmltojson('xmltojson', url_port_details.node_env, processaffliationresponse.body, "affiliation");
						let parsedJSON = JSON.parse(responsefromxmltojson);

						/*Setting the ID in New JSON format*/
						parsedJSON.affiliation['@'] = { "id": id };

						/*If Orgname is undefined from JSON response */
						if (parsedJSON.affiliation.orgName != undefined) {
							const orgnamearr = parsedJSON.affiliation.orgName;
							let orgdivision = [];
							let orgname = [];
							let orgdivisionobj = "";
							let orgnameobj = "";
							orgnamearr.forEach(orgnameele => {
								if (orgnameele['@'] !== undefined) {
									var type = orgnameele['@'].type;
									if (type == 'department' || type == 'laboratory') {
										delete orgnameele['@'];
										orgdivisionobj += orgnameele['#'] + " ";
									}

									if (type == 'institution') {
										delete orgnameele['@'];
										orgnameobj += orgnameele['#'] + " ";
									}

								}
							});
							orgdivision.push({ "#": orgdivisionobj });
							parsedJSON.affiliation.orgdivision = orgdivision;
							orgname.push({ "#": orgnameobj });
							parsedJSON.affiliation.orgname = orgname;
							delete parsedJSON.affiliation.orgName;
						}

						/*If orgaddress is undefined from JSON response */
						if (parsedJSON.affiliation.address != undefined) {
							const addrarr = parsedJSON.affiliation.address;

							/*Replacing the keys values in the JSON format*/
							const replaceaddrarr = { "addrLine": "street", "postCode": "postcode", "settlement": "city", "country": "country", "region": "state" };
							function replaceKeyInObjectArray(addrarr, replaceaddrarr) {
								return addrarr.map(o =>
									Object.keys(o).map((key) => ({ [replaceaddrarr[key] || key]: o[key] })
									).reduce((addrarr, b) => Object.assign({}, addrarr, b))
								)
							};
							const repacedval = replaceKeyInObjectArray(addrarr, replaceaddrarr);
							delete parsedJSON.affiliation.address;
							parsedJSON.affiliation.orgaddress = repacedval;

							/*If country is undefined from JSON response */
							if (parsedJSON.affiliation.orgaddress[0].country !== undefined) {
								if (parsedJSON.affiliation.orgaddress[0].country[0]["@"] !== undefined) {
									if (parsedJSON.affiliation.orgaddress[0].country[0]["@"].key !== undefined) {
										parsedJSON.affiliation.orgaddress[0].country[0]["@"].code = parsedJSON.affiliation.orgaddress[0].country[0]["@"].key
										delete parsedJSON.affiliation.orgaddress[0].country[0]["@"].key;
									}
								}
							}
						}
						/*Modified Successfull JSON format*/
						process.send({ counter: { status: 200, msg: JSON.stringify(parsedJSON) } });
						process.exit();

					} catch { /*If error from request arguments*/
						process.send({ counter: { status: 400, msg: 'Unsupported request argument' } });
						process.exit();
					}


				}

			});
		}
	}

}

// receive message from master process
process.on('message', async (message) => {
	await sendMultipleXml(message);
});