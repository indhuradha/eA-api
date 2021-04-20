
const preprocessor = require('../utils/processor');
var fs = require('fs');

async function ReadPath(data_folder_path, res) {
	if (fs.existsSync(data_folder_path)) {
		fs.readFile(data_folder_path, function (err, data) {
			if (err) throw err // Fail if the file can't be read.
			else {
				res.writeHead(200, { 'Content-Type': 'image/jpeg' })
				res.end(data) // Send the file data to the browser.
			}
		})
	} else {
		res.end('Specific image is not found');
	}
}

exports.ServeImage = (req, res) => {
	const Token = {
		'method': 'get', 'tk': req.query
	}

	const input = preprocessor.preProcessSentToToken(Token);
	const dataFolderPath = preprocessor.preProcessGetDataFolder(input);

	if (req.query.imgType !== 'cover') {

		var data_folder_path = dataFolderPath.dataFolderPath + '/' + 'images' + '/' + req.query.name;
	} else {
		
		var data_folder_path = dataFolderPath.dataFolderPath + "/Cover/" + dataFolderPath.jnls_bks_no + '_Cover.jpg';
	}

	ReadPath(data_folder_path, res);


}



