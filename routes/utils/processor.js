/*token.js to get the decrypted data from the token */
let jwtToken = require('../token');
/*url_port_details.js file for port & other server endpoint details*/
let url_port_details = require('../url_port_details');
const { path } = require('../app');
/* To get the current date */
var year = new Date().getFullYear();
let fs = require('fs');
let glob = require('glob');


const GetForkinput = payLoad => {
   const PayValue = payLoad.keys;
   const dataval = payLoad.data;

   var input = {
      "savecontent": dataval.tk.savecontent,
      'chapter_no': PayValue[0].chapter_no, 'book_no': PayValue[0].book_no,
      'jnls_no': PayValue[0].jnls_no, 'art_no': PayValue[0].art_no,
      'method': dataval.tk.method, 'token': dataval.tk.token, 'type': PayValue[0].type,
      dbtype: dataval.tk.dbtype,

      'width': dataval.tk.width,
      'height': dataval.tk.height,
      'left': dataval.tk.left,
      'top': dataval.tk.top,
      'test': dataval.tk.test,
      'id': dataval.tk.id,
      'ImageTagId': dataval.tk.ImageTagId,
      'imgannotype': dataval.tk.imgannotype,

      'part_status': dataval.tk.part_status,
      'idtype': dataval.tk.idtype,
      'displaynumber': dataval.tk.displaynumber,
      'selectedValue': dataval.tk.selectedValue,
      'unselectedValue': dataval.tk.unselectedValue,
      'booktoken': dataval.tk.booktoken,
      'list': dataval.tk.list,
      'chapterid': dataval.tk.chapterid,
      'primaryterm': dataval.tk.primaryterm,
      'secondaryterm': dataval.tk.secondaryterm,
      'tertiaryterm': dataval.tk.tertiaryterm,
      'seeterm': dataval.tk.seeterm,
      'seealsoterm': dataval.tk.seealsoterm,
      'termtype': dataval.tk.termtype,
      'term': dataval.tk.term,
      'indextermtype': dataval.tk.indextermtype,
      'correction': dataval.tk.correction,
      'title': dataval.tk.title,
      'addtype': dataval.tk.addtype,



   }
   return input;

}


exports.preProcessCreateLogFile = LogFile => {
   if (!fs.existsSync(LogFile.dataFolderPath)) {
      fs.mkdirSync(LogFile.dataFolderPath);
   }

   if (!fs.existsSync(LogFile.signalWriteFilePath)) {
      fs.writeFile(LogFile.signalWriteFilePath, LogFile.logcnt, function (err) {
      })
   }
   else {
      fs.readFile(LogFile.signalWriteFilePath, { encoding: 'utf-8' }, function (err, content) {
         fs.writeFile(LogFile.signalWriteFilePath, content + '\n' + LogFile.logcnt, function (err) {
         })
      })
   }
   return LogFile.file_Path;
}


exports.preProcessSentToToken = Token => {
   /* If token is not send in the request*/
   var FkProcess = '';
   if (Token.tk.token == '' || Token.tk.token == undefined) {
       FkProcess = 'Please check with token provided';
       return FkProcess;
   }
   else {
      /*To get the payload from the token*/
      var payLoad = jwtToken.getCyper(Token.tk.token);
      if (payLoad) {
         const url = {
            'keys': payLoad, 'data': Token

         }
          FkProcess = GetForkinput(url);

      } else {
         FkProcess = 'Invalid Token';
      }
      return FkProcess;
   }
}


async function Get_Html_Path(g_dataFilePath) {
   return new Promise(async (r) => {
      glob(g_dataFilePath, {}, (err, files) => {
         console.log('files', files)
         r(files[0]);
      })
   });
}


exports.preProcessGetDataFolder = async (payLoad) => {
   if (payLoad) {
      var type = payLoad.type;
      var dataFilePath ='';
      if (type == 'bks') {
         var jnls_bks_no = payLoad.book_no;
         var art_chap_no = payLoad.chapter_no;
         var data_File_Path = jnls_bks_no + '_' + art_chap_no + '.html';
          dataFilePath = url_port_details.filePath + url_port_details[type] + jnls_bks_no + "/" + art_chap_no + "/" + data_File_Path;
      } else {
         var jnls_bks_no = payLoad.jnls_no;
         var art_chap_no = payLoad.art_no;
         var data_File_Path = `${jnls_bks_no}_*_${art_chap_no}_Article.html`;
         var g_dataFilePath = `${url_port_details.filePath}${url_port_details[type]}${jnls_bks_no}/${art_chap_no}/${data_File_Path}`;
          dataFilePath = await Get_Html_Path(g_dataFilePath);
         var dataFolderPath = url_port_details.filePath + url_port_details[type] + jnls_bks_no + "/" + art_chap_no + "/";
         var dataFolder_book = url_port_details.filePath + url_port_details[type] + jnls_bks_no + "/";
      }

      return { dataFolder_book, dataFolderPath, dataFilePath, jnls_bks_no, art_chap_no };
   }

}
