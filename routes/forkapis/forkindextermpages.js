
/*START#############################################
#
#  Purpose  :Fork method js for forkIndexTerm.
#
#  Author   : Indhumathi R
#
#  Client   : e-authoring
#
#  Date     : April 27, 2020
#

######################################################################END*/

/*url_port_details.js file for port & other server endpoint details*/
let url_port_details = require('../url_port_details');
let databaseurl = require(url_port_details.dbPath + 'db');
var _ = require('lodash');
let fs = require('fs');
const preprocessor = require('../utils/processor');


async function ForkIndexTerm(payLoad) {
    try {
        const dataFolderPath = await preprocessor.preProcessGetDataFolder(payLoad);

        if (fs.existsSync(dataFolderPath.dataFolder_book)) {
            // open a database connection
            var db = databaseurl.db(payLoad.token, payLoad.dbtype);
            db.all("SELECT * FROM indextable WHERE status != 3 ORDER BY primaryterm COLLATE NOCASE ASC", (err, data) => {
                var stateval = ''
                const db = data
                const uni = [...new Set(data.map(i => i.primaryterm))]
                var index_terms = [];
                uni.map(function (item) {
                    var arr = []
                    arr[item] = ''
                    return index_terms.push(arr);
                })
                index_terms.map(function (val1) {
                    var tmp_secnd_term = [];
                    var tmp_tertiary_term = [];
                    data.map(function (val) {
                        if (Object.keys(val1)[0] === val.primaryterm) {
                            if (val.secondaryterm) {
                                if (!Object.keys(tmp_secnd_term).includes(val.secondaryterm)) {
                                    if (val.tertiaryterm && !(tmp_tertiary_term.includes(val.tertiaryterm))) {
                                        tmp_tertiary_term.push(val.tertiaryterm)
                                        tmp_secnd_term[val.secondaryterm] = [val.tertiaryterm];
                                    }
                                    else {
                                        tmp_secnd_term[val.secondaryterm] = ''
                                    }
                                }
                                else {
                                    if (val.tertiaryterm && val.tertiaryterm != null && !(tmp_tertiary_term.includes(val.tertiaryterm))) {
                                        tmp_tertiary_term.push(val.tertiaryterm)
                                        var tum = [...tmp_secnd_term[val.secondaryterm]]
                                        tmp_secnd_term[val.secondaryterm] = [...tum, val.tertiaryterm]
                                    }
                                }

                            }
                        }
                    })
                    return index_terms[Object.keys(val1)[0]] = tmp_secnd_term;
                })
                index_terms.map(function (data) {
                    var chapterNO_see_and_seeAlso = prepareSeeSeeAlsoList(db, 'primaryterm', Object.keys(data)[0], 'iPage_seeterm', 'iPage_seeAlsoterm');
                    var index_item = '';
                    var index_item = `<div class="ipage_indexterm"><div class="ipage_primaryterm"><span>${Object.keys(data)[0]}</span>${chapterNO_see_and_seeAlso}</div>`;
                    var secc = [];
                    secc = index_terms[Object.keys(data)[0]]
                    var destinationObj = {};

                    Object.assign(destinationObj, secc);
                    destinationObj && Object.entries(destinationObj).map(function (data1) {
                        chapterNO_see_and_seeAlso = prepareSeeSeeAlsoList(db, 'secondaryterm', data1[0], 'iPage_sec_seeterm', 'iPage_sec_seealsoterm');

                        index_item += `<div class="iPage_secondaryterm"><span>${data1[0]}</span>${chapterNO_see_and_seeAlso}</div>`;
                        data1[1] && data1[1].map((data2, k) => {
                            chapterNO_see_and_seeAlso = prepareSeeSeeAlsoList(db, 'tertiaryterm', data2, 'iPage_ter_seeterm', 'iPage_ter_seealsoterm');

                            return index_item += `<div class="iPage_tertiaryterm"><span>${data2}</span>${chapterNO_see_and_seeAlso}</div>`;
                        })
                        return index_item;
                    })
                    index_item += "</div>";
                    return stateval = stateval + index_item;
                })
                function prepareSeeSeeAlsoList(datas, term, value, see, seealso) {
                    var db_query
                    if (term === 'primaryterm') {
                        db_query = datas.filter(function (val) {
                            return val.primaryterm === value && val.status != 3 && val.secondaryterm === null && val.tertiaryterm === null
                        });
                    } else if (term === 'secondaryterm') {
                        db_query = _.filter(datas, function (val, key) {
                            return val.secondaryterm === value && val.status != 3 && val.tertiaryterm === null
                        })

                    } else if (term === 'tertiaryterm') {
                        db_query = _.filter(datas, function (val, key) {
                            return val.status != 3 && val.tertiaryterm === value
                        })
                    }
                    var chaper_num_text = "";
                    var see_text = "";
                    var see_also_text = "";
                    if (db_query && db_query.length) {
                        db_query.map((row, i) => {
                            chaper_num_text += `<a href='#' class='navindex' token=${row.token} id=${row.id}>${'#'} ${row.chapterid}</a>` + '  ';
                            if (row.seeterm) {
                                see_text += `<span class=${see}>${row.seeterm}</span>, `;
                            }
                            if (row.seealsoterm) {
                                see_also_text += `<span class=${seealso}>${row.seealsoterm}</span>, `;
                            }

                        })
                    }
                    if (see_text != "") {
                        see_text = `<span class=${see}><span>See</span>${see_text}</span>`;
                    }
                    if (see_also_text != "") {
                        see_also_text = `<span class=${seealso}><span>SeeAlso</span>${see_also_text}</span>`;
                    }
                    var ret_val = '' + chaper_num_text + see_text + see_also_text
                    return ret_val
                }
                if (err) {
                    process.send({ counter: { status: 400, msg: err } });
                    process.exit();
                }
                else {
                    process.send({ counter: { status: 200, msg: stateval } });
                    process.exit();
                }
            });
        } else {
            process.send({ counter: { status: 400, msg: 'File is not exits in this path ' + dataFolderPath.dataFolder_book } });
            process.exit();
        }
    }
    catch (error) {
        process.send({ counter: { status: 400, msg: error } });
        process.exit();
    }
}

// receive message from master process
process.on('message', async (message) => {
    await ForkIndexTerm(message);
});