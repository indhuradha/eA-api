
/*npm xml2js to convert xml to json format*/
let xml2js = require('xml2js');

/* npm log4js for writing Information and error logs */
// var log4js = require('./apis/log4fun.js');
// var infoLogger = log4js.logger;
// var errorlog = log4js.errorlogger;

// var logmsg = " ";

// var currentWeekNumber = require('current-week-number');

var rp = require('request-promise');
module.exports =
{
	nameToLowerCase: function (name) {
		return name.toLowerCase();
	},
	tagProcess: function (xml) {
		xml = xml.replace(/\n/g, '');
		xml = xml.replace(/\t/g, '');
		xml = xml.replace(/\s{2,}/g, '');
		xml = xml.replace(/<strong>/ig, 'boldopen');
		xml = xml.replace(/<b>/ig, 'boldopen');
		xml = xml.replace(/<em>/ig, 'emopen');
		xml = xml.replace(/<i>/ig, 'emopen');
		xml = xml.replace(/<\/strong>/ig, 'boldclose');
		xml = xml.replace(/<\/b>/ig, 'boldclose');
		xml = xml.replace(/<\/em>/ig, 'emclose');
		xml = xml.replace(/<\/i>/ig, 'emclose');

		xml = xml.replace(/\\ufeff/ig, "");
		return xml;
	},
	replaceTag: function (val) {
		val = val.replace(/boldopen/ig, '<b>');
		val = val.replace(/emopen/ig, '<i>');
		val = val.replace(/boldclose/ig, '</b>');
		val = val.replace(/emclose/ig, '</i>');
		val = val.replace(/<check>/ig, '');
		val = val.replace(/<\/check>/ig, '');
		return val;
	},

	tokenfun: function (token, envvar, content, response, apiname) {
		if (token == undefined || token == '') {
			//logmsg = log4js.getLogInJSON(apiname, new Date(), "NA", "NA", "NA", token, envvar, content, { 'message': { 'Error': 'method was not supplied' } });
			//	errorlog.error(JSON.stringify(logmsg));
			return response.status(400).send(JSON.stringify({ 'ErrorCode': 'method was not supplied' }));
		} else if (content == undefined || content == '') {
			//logmsg = log4js.getLogInJSON(apiname, new Date(), "NA", "NA", "NA", token, envvar, content, { 'message': { 'Error': 'content argument was not supplied' } });
			//	errorlog.error(JSON.stringify(logmsg));
			return response.status(400).send(JSON.stringify({ 'ErrorCode': 'content argument was not supplied' }));
		}
	},

	fundingInfoArticleCollecFun: function (method, token, envvar, content, response, apiname, jno, artno) {
		/*If method is not send in the request*/
		if (method == undefined || method == '') {
			//logmsg = log4js.getLogInJSON(apiname, new Date(), jno, artno, token, method, envvar, content, { 'message': { 'Error': 'input method was not supplied' } });
			//	errorlog.error(JSON.stringify(logmsg));
			return response.status(400).send(JSON.stringify({ 'error': 'method was not supplied' }));
		}
		/*If content is not send in the request*/
		else if (content == undefined || content == '') {
			//logmsg = log4js.getLogInJSON(apiname, new Date(), jno, artno, token, method, envvar, content, { 'message': { 'Error': 'content argument was not supplied' } });
			//	errorlog.error(JSON.stringify(logmsg));
			return response.status(400).send(JSON.stringify({ 'ErrorCode': 'content argument was not supplied' }));
		}

		else if (token == undefined || token == '') {
			//logmsg = log4js.getLogInJSON(apiname, new Date(), jno, artno, token, method, envvar, content, { 'message': { 'Error': 'token argument was not supplied' } });
			//	errorlog.error(JSON.stringify(logmsg));
			return response.status(400).send(JSON.stringify({ 'ErrorCode': 'token was not supplied' }));
		}
	},

	affiAuthorxmltojson: function (token, envvar, content, apiname) {
		let jsonres = "";
		xml2js.parseString(content, {
			explicitArray: true, explicitCharkey: true, trim: true, charkey: '#', emptyTag: { "#": '' },
			attrkey: '@', preserveChildrenOrder: true, mergeAttrs: false, ignoreAttrs: false, charsAsChildren: true,
			explicitRoot: true
		}, (err, res) => {
			if (err) {
				console.log(err);
				//logmsg = log4js.getLogInJSON(apiname, new Date(), "NA", "NA", "NA", token, envvar, content, { 'message': { 'Error': err } });
				//	errorlog.error(JSON.stringify(logmsg));
				return JSON.stringify(err);
			}
		//	logmsg = log4js.getLogInJSON(apiname, new Date(), "NA", "NA", "NA", token, envvar, content, { 'message': 'success' });
			//	infoLogger.info(JSON.stringify(logmsg));
			jsonres = JSON.stringify(res);
			console.log('jsonres',jsonres);
			
		});
		return jsonres;
	},

	usernameExists: function (payload) {
		var username = "";
		if (payload !== undefined) {
			console.log('username exists');
			username = payload;
		} else if (payload == 'unknown' || payload == undefined) {
			console.log('username not exists');
			username = 'unknown';
		}

		return username;
	}


};
