/* url_port_details.js file for port & other server endpoint details */
let url_port_details = require('../url_port_details');
const { fork } = require('child_process');

exports.Reference = (req, res) => {

	const forkJsUrl = url_port_details.forkPath + 'forkreference.js';

	var input = {
		'searchtype': req.body.searchtype, 'reftext': req.body.reftext, "content": req.body.content,
		"type": req.body.type,
		"method": req.body.method
	}
	/* fork another process */
	const process = fork(forkJsUrl);

	/* send list of inputs to forked process */
	process.send(input);
	// listen for messages from forked process
	process.on('message', (message) => {
		if (message) {
			if (message.counter.status === 300) {
				res.status(300).send(message.counter.msg);
			} else if (message.counter.status === 400) {
				res.status(400).send(message.counter.msg);
			} else if (message.counter.status === 404) {
				res.status(404).send(message.counter.msg);
			} else if (message.counter.status === 200) {
				res.status(200).send(message.counter.msg);
			}
		} else {
			res.status(400).send('Unable to process the request');
		}
	})
}

