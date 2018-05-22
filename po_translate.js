#!/usr/bin/env node

const createCsvWriter = require('csv-writer').createArrayCsvWriter
const translator = require('./translate.js')
const nodePo = require('pofile')
let program = require('commander')
let pjson = require('./package.json')
 
program
  .version(pjson.version)
  .option('-f, --file <file>', 'Original po file')
  .option('-o, --output <output>', 'Output file name')
  .option('-l, --language <language>', 'Language to translate to')
  .option('-c, --cache [cache]', 'Cache file', 'translations.json')
  .parse(process.argv)

let { language, cache, file, output } = program

let options = {
  language, cache, file, output
}

Object.keys(options)
  .forEach(optionKey => {
    if(!options[optionKey]) {
      program.outputHelp((help) => "'" + optionKey + "' not supplied\n" + help)
      process.exit()
    }
  })

let translate = translator({
  cache
})

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
    }
  })
  await Promise.all(translationOperations)
  await savePoFile(po, translatedFilename)
}

main()