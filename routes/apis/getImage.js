/*START#############################################
#
#  Purpose  : Get images from images/upload folder,
#
#  Author   : Indhumathi R
#
#  Client   : E-authoring
#
#  Date     : july 15 2020
*/
/* npm express route for getImage */
let getImage = require('express').Router();

/*token.js to get the decrypted data from the token */
let jwtToken = require('../token.js');
/*To get the value of other server url details*/
const { fork } = require('child_process');
/*url_port_details.js file for port & other server endpoint details*/
let url_port_details = require('../url_port_details');


/*TO GET THE REQUEST RECEIVED TIMESTAMP*/
getImage.use(function timeLog(req, res, next) {
	console.log("E-authoring get image api load " + req.method + " Request Received at " + Date.now() + "\n");
	next()
});

/*POST METHOD FOR getImage*/
getImage.post('/', function (request, response, next) {
	response.status(400).send(JSON.stringify({ 'error': 'Post process cannot be done. please use get' }));
});

/*GET METHOD FOR getImage*/
getImage.get('/', function (request, response, next) {
	var token = request.query.token;
	try {
		/* If token is not send in the request*/
		if (token == '' || token == undefined) {
			response.status(400).send(JSON.stringify({ 'error': 'Invalid or empty Token' }));
		}
		else {
			/*To get the payload from the token*/
			var payLoad = jwtToken.getCyper(token);
			if (payLoad != 0) {
				// fork another process
				const process = fork(url_port_details.forkPath + 'forkgetImage.js');
				var input = {
					'payLoad': payLoad
				}
				// send list of inputs to forked process
				process.send(input);
				// listen for messages from forked process
				process.on('message', (message) => {
					if (message !== undefined) {
						if (message.counter.status == 200) {
							response.status(200).send(message.counter.msg);
						} else if (message.counter.status == 400) {
							response.status(200).send(message.counter.msg);
						} else {
							response.status(200).send(message.counter);

						}
					} else {
						response.status(400).send('Unable to process the request');
					}
				}); process.on('exit', (exit) => {
				});

			}
			/*If error occurs in parsing the token*/
			else {
				response.status(400).send(JSON.stringify({ 'error': 'unable to parse token' }));
			}
		}
	}
	/*404 error*/
	catch (error) {
		response.json({ status: 404, msg: "Please check with token provided" });
	}
});

module.exports = getImage;