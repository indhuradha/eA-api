

/*npm express framework*/
var express = require('express');
var app = express();
/*npm bodyparser to accept the json response */
let bodyParser = require('body-parser');
const morgan = require('morgan')
/*config.json file for port & other server endpoint details*/
let url_port_details = require('./url_port_details.js');


let Html = require("./apis/getHtml");
let save = require("./apis/savehtml");
let token = require("./apis/getToken");
let imgno = require("./apis/imganno");
let serve = require("./apis/serveImage");
let Math = require("./apis/getMath");
let bookdetails = require("./apis/bookdetails");
let asignpartchapter = require("./apis/asignpartchapter");
let activeInactiveList = require("./apis/activeInactiveList");
let indexterm = require("./apis/indexterm");
let indextermpages = require("./apis/indextermpages");
let gettokendetails = require("./getTokenDetails");
let trackchange = require("./apis/trackChange");
let addpartchapter = require("./apis/addpartchapter.js");
let author = require("./apis/author");
let affiliation = require("./apis/affiliation");
let upload = require("./apis/upload");
let reference = require("./apis/reference");
let submitchapter = require("./apis/submitchapter.js");


app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));// support encoded bodies
app.use(bodyParser.json({ limit: '500mb', extended: true }));// support json encoded bodies

app.use(morgan('dev'))
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.use(bodyParser.json());

app.all('/', (req, res) => res.send('Welcom to the E-authoring services. No exact details are provided'));


/*Endpoint URL for all the routes*/
app.get('/eA-api/gethtml', Html.GetHtml);
app.post('/eA-api/savehtml', save.SaveHtml);
app.get('/eA-api/gettoken', token.GetToken);
app.get('/eA-api/imganno', imgno.GetImganno);
app.post('/eA-api/imganno', imgno.PostImganno);
app.get('/eA-api/serveImage', serve.ServeImage);
app.get('/eA-api/getmath', Math.GetMath);
app.get('/eA-api/bookdetails', bookdetails.BookDetails);
app.get('/eA-api/asignpartchapter', asignpartchapter.GetAsignPartChapter);
app.post('/eA-api/asignpartchapter', asignpartchapter.PostAsignPartChapter);
app.post('/eA-api/activeInactiveList', activeInactiveList.ActiveInactiveList);
app.post('/eA-api/indexterm', indexterm.IndexTerm);
app.post('/eA-api/indextermpages', indextermpages.IndexTermPages);
app.get('/eA-api/gettokendetails', gettokendetails.GetTokenDetails);
app.post('/eA-api/author', author.Author);
app.post('/eA-api/affiliation', affiliation.AffiliAtion);
app.get('/eA-api/upload', upload.GetUpload);
app.post('/eA-api/upload', upload.PostUpload);
app.post('/eA-api/reference', reference.Reference);
app.post('/eA-api/submitchapter', submitchapter.SubmitChapter);
app.get('/eA-api/trackChange', trackchange.TrackChange);
app.post('/eA-api/addpartchapter', addpartchapter.AddPartChapter);


module.exports = app


