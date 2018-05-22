let googleTranslateAPI = require('google-translate-api')
const fs = require('fs-extra')
const json = require('json-promise')

let storageFilename = "translations.json"
let translationsCache = null

async function storeToStorage(storageFilename, translations) {
  let jsonString = await json.stringify(translations)
  await fs.writeFile(storageFilename, jsonString)
}

async function retrieveFromStorage(storageFilename) {
  let fileRawString = await fs.readFile(storageFilename)
  let fileString = fileRawString.toString()
  let translationsCache = await json.parse(fileString)
  return translationsCache
}

async function getTranslationFromCache(str, language) {
  if(!translationsCache) {
    try {
      translationsCache = await retrieveFromStorage(storageFilename)
    } catch {
      translationsCache = {}
    }
  }
  if(translationsCache[str]) {
    return translationsCache[str]
  } else {
    return null
  }
}

async function cacheTranslations(translations) {
  return await storeToStorage(storageFilename, translations)
}

async function cacheTranslation(original, translation, language) {
  if(!translationsCache) {
    translationsCache = {}
  }
  translationsCache[original] = translation
  return await cacheTranslations(translationsCache)
}

async function googleTranslate(str, language) {
  return googleTranslateAPI(str, {to: language})
    .then(res => res.text).catch(() => null)
}

module.exports = async function(original, language) {
  var translation = ""
  translation = await getTranslationFromCache(original, language) || await googleTranslate(original, language)
  if(translation == null) {
    console.error("Translation unavailable for '", original , "'")
  }
  await cacheTranslation(original, translation)
  return translation
}