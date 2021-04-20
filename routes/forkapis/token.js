

/*START#############################################
#
#  Purpose  : Encrypt & decrypt methods of token using NPM crypto-js 
#
#  Author   : Indhumathi R
#
#  Client   : SPS
#
#  Date     : April 13, 2020
#
*/

let CryptoJS = require("crypto-js");

module.exports =
{
	getCyper: function (ciphertext) {
		ciphertext = (ciphertext.replace(/-/g, '+'));
		ciphertext = (ciphertext.replace(/_/g, '/'));
		const keyutf = CryptoJS.enc.Utf8.parse('WcYk\\AKp');
		const iv = CryptoJS.enc.Base64.parse('WcYk\\AKp');
		const dec = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Base64.parse(ciphertext) }, keyutf, { iv: iv });
		try {
			const decryptedData = JSON.parse(CryptoJS.enc.Utf8.stringify(dec));
			if (JSON.stringify(decryptedData) != '') {
				return decryptedData;
			}
			return 0;
		} catch{
			return null;
		}
		
	},
	getEncrypt: function (token) {
		var data = " ";
		if ((token.chapter_no == undefined) && (token.book_no !== undefined && token.book_no !== '')) {
				data = [{book_no: token.book_no }]
		}else if ((token.chapter_no !== undefined && token.book_no !== '') && (token.chapter_no !== undefined && token.book_no !== '')) {
			data = [{ chapter_no: token.chapter_no, book_no: token.book_no }]
		}

		const keyutf = CryptoJS.enc.Utf8.parse('WcYk\\AKp');
		const iv = CryptoJS.enc.Base64.parse('WcYk\\AKp');

		var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), keyutf, { iv: iv });
		ciphertext = ciphertext.toString();
		ciphertext = (ciphertext.replace(/\+/g, '-'));
		ciphertext = (ciphertext.replace(/\//g, '_'));
		return ciphertext;
	}
}; 