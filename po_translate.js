const createCsvWriter = require('csv-writer').createArrayCsvWriter
const translate = require('./translate.js')
const nodePo = require('pofile')

let language = 'zh-CN'

function loadPoFile(poFilename) {
  return new Promise((resolve, reject) => {
    nodePo.load(poFilename, (err, po) => resolve(po))
  })
}

function savePoFile(po, poFilename) {
  return new Promise((resolve, reject) => {
    po.save(poFilename, (err, po) => resolve(po))
  })
}

async function main(){
  const filename = 'zh.po'
  const translatedFilename = 'zh_translated.po'
  const po = await loadPoFile(filename)
  const language = 'zh-CN'

  let translationOperations = po.items.map(async (item) => {
    let original = item['msgid']
    let translation = ""
    try {
      translation = await translate(original, language)
    } catch {}
    item['msgstr'] = translation

    let plural_original = item['msgid_plural']
    if(plural_original) {
      translation = await translate(original, language)
      item['msgstr'] = [translation]
      console.log(item, plural_original)
    }
  })
  await Promise.all(translationOperations)
  await savePoFile(po, translatedFilename)
}

main()