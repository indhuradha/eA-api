/*token.js to get the encrypted data from the token */
let jwtToken = require('../token.js');

exports.GetToken = (req, res) => {
	if ((req.query.chapter_no !== undefined && req.query.book_no !== undefined) && req.query.type != undefined) {
		res.status(200).send(jwtToken.getEncrypt(req.query));
	} else if (req.query.book_no !== undefined && req.query.type != undefined) {
		res.status(200).send(jwtToken.getEncrypt(req.query));

	} else if ((req.query.jnls_no !== undefined && req.query.art_no !== undefined) && req.query.type != undefined) {
		res.status(200).send(jwtToken.getEncrypt(req.query));
	} else {
		res.status(400).send('jnls_no|art_no|books_no|chapter_no|type Paramter invalid in this token');
	}
}

