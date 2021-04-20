

/* url_port_details.js file for port & other server endpoint details */
let url_port_details = require('../url_port_details');
const { fork } = require('child_process');
let xml2js = require('xml2js');
/* npm fs,xml2js methods for services */
let fs = require('fs');


const options = {
	explicitArray: false, explicitCharkey: false, trim: true,
	attrkey: '@', preserveChildrenOrder: true, explicitRoot: true
}


exports.GetMath = (req, res) => {

	/* read the math.xml file from the project folder using npm fs*/
	var xml = fs.readFileSync(__dirname + '/math.xml');

	/*npm to convert the xml2js ,which converts the math,xml file content to json*/
	var parseString = xml2js.parseString;
	parseString(xml, options, (err, response) => {
		if (err) {
			res.status(400).send(err);
		} else {
			// fork another process
			const process = fork(url_port_details.forkPath + 'forkgetMath.js');
			var input = {
				'input': response
			}
			// send list of inputs to forked process
			process.send(input);
			// listen for messages from forked process
			process.on('message', (message) => {
				if (message !== undefined) {
					if (message.counter.status == 200) {
						res.status(200).send(message.counter.msg);
					} else {
						res.status(400).send(message.counter.msg);
					}
				} else {
					res.status(400).send('Unable to process the request');
				}
			}); process.on('exit', (exit) => {
			});

		}
	})
}