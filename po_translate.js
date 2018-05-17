const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const translate = require('google-translate-api');
const fs = require('fs');

async function getTranslation(str) {
  return new Promise((resolve, reject) => {
    translate(str, {to: 'zh-CN'}).then(res => {
      resolve(res.text);
    }).catch(err => {
        reject(err);
    });
  })
}

async function main(){
  const file = '../inwavethemes-en_US.pot';
  const readFile = fs.readFileSync(file).toString()
  let slices = readFile.split("\n\r")
  let terms = slices.slice(1)
  let top = slices[0]

  results = terms.map(async str => {
    let heading = str.split("msgid")[0].trim()
    let re = /msgid[ *]"(.*)"\r\nmsgstr[ *]"/g;
    let matches = re.exec(str)
    if (matches == null){
      return ["cannot find msgid", str]
    }
    let msgid = matches[1]
    try {
      let translation = await getTranslation(msgid)
      return {msgid, heading, translation}
    } catch(error) {
      return {msgid, heading, error}
    }
  })
  results = await Promise.all(results)
  // const csvWriter = createCsvWriter({
  //   header: ['Original', 'Chinese'],
  //   path: 'cn.csv'
  // });
  
  // await csvWriter.writeRecords(results)
  // console.log('...Done')

  let str = top + "\r\n"
  results.forEach(result => {
    let { msgid="" , translation="", heading="" } = result
    if (result.error) {
      translation = result.error
    }
    str += heading + "\r\n"
    str += 'msgid "' + msgid + '"\r\n'
    str += 'msgstr "' + translation + '"\r\n\r\n'
  })
  console.log(str)  
}

main();