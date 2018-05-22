#!/usr/bin/env node

const createCsvWriter = require('csv-writer').createArrayCsvWriter
const translator = require('./translator.js')
const nodePo = require('pofile')
let program = require('commander')
let pjson = require('./package.json')

program
  .version(pjson.version)
  .description("Homepage " + pjson.homepage)
  .option('-f, --file <file>', 'Original po file')
  .option('-o, --output <output>', 'Output file name')
  .option('-l, --language <language>', 'Language to translate to')
  .option('-c, --cache [cache]', 'Cache file', 'translations.json')
  .parse(process.argv)

let {
  language,
  cache,
  file,
  output
} = program

let options = {
  language,
  cache,
  file,
  output
}

Object.keys(options)
  .forEach(optionKey => {
    if (!options[optionKey]) {
      program.outputHelp((help) => "'" + optionKey + "' not supplied\n" + help)
      process.exit()
    }
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

async function main(options) {
  const {
    file,
    language,
    cache,
    output
  } = options
  const po = await loadPoFile(file)

  let translate = translator({
    cache
  })

  let translationOperations = po.items.map(async (item) => {
    let original = item['msgid']
    let translation = ""
    try {
      translation = await translate(original, language)
    } catch (e) {
      console.error('No translation for ', original, e)
    }
    item['msgstr'] = translation

    let plural_original = item['msgid_plural']
    if (plural_original) {
      try {
        translation = await translate(original, language)
      } catch (e) {
        console.error('No translation for ', original, e)
      }
      item['msgstr'] = [translation]
    }
  })
  await Promise.all(translationOperations)
  await savePoFile(po, output)
}

main(options)