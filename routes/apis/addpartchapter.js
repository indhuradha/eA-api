
const preprocessor = require('../utils/processor');
/* url_port_details.js file for port & other server endpoint details */
let url_port_details = require('../url_port_details');
const { fork } = require('child_process');
const formidable = require('formidable');
const forkJsUrl = url_port_details.forkPath + 'forkaddpartchapter.js';

exports.AddPartChapter = (req, res) => {
    try {
        if (req.body.booktoken == undefined) {
            const form = new formidable.IncomingForm();

            form.parse(req, (err, fields, files) => {
                if (err) {
                    response.status(400).send(err)
                } else {
                    const Token = {
                        'tk': { 'token': fields.booktoken },
                    }
                    const input = preprocessor.preProcessSentToToken(Token);
                    input.fields = fields;
                    input.files = files;
                    /* fork another process */
                    const process = fork(forkJsUrl);
                    /* send list of inputs to forked process */
                    process.send(input);
                    // listen for messages from forked process
                    process.on('message', (message) => {
                        if (message) {
                            if (message.counter.status == 200) {
                                res.status(200).send(message.counter.msg);
                            } else {
                                res.status(400).send(message.counter.msg);
                            }
                        } else {
                            res.status(400).send('Unable to process the request');
                        }
                    })


                }
            });
        } else {
            /*Generating jour_no & art_no using npm crypto-js method*/

            const Token = {
                'tk': { 'token': req.body.booktoken },
            }
            const input = preprocessor.preProcessSentToToken(Token);
            input.fields = {
                'booktoken': req.body.booktoken,
                'title': req.body.title, 'addtype': req.body.addtype, 'part_status': req.body.part_status, 'dbtype': req.body.dbtype
            }

            const process = fork(forkJsUrl);
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
            })
        }

    } catch (error) {
        res.status(400).send(JSON.stringify({ 'error': 'Please check with token provided' }));
    }
}

