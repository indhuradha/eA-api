
const preprocessor = require('../utils/processor');
/* url_port_details.js file for port & other server endpoint details */
let url_port_details = require('../url_port_details');
const { fork } = require('child_process');

exports.TrackChange = (req, res) => {

	const forkJsUrl = url_port_details.forkPath + 'forktrackChange.js';

	const Token = {
		'forkJsUrl': forkJsUrl, 'tk': req.query
	}

	const input = preprocessor.preProcessSentToToken(Token);

	/* fork another process */
	const process = fork(forkJsUrl);

	/* send list of inputs to forked process */
	process.send(input);
	// listen for messages from forked process
	process.on('message', (message) => {
		if (message) {
			if (message.counter.status == 200) {
			res.sendFile(message.counter.msg);
			} else {
				res.status(400).send(message.counter.msg);
			}
		} else {
			res.status(400).send('Unable to process the request');
		}
	})
}