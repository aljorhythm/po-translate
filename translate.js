/**
 * Translation abstraction
 * Use free google-translate-api if available. A cache
 * is implemented
 */
let googleTranslateAPI = require('google-translate-api')
const fs = require('fs-extra')
const json = require('json-promise')

async function storeToStorage(translationsCache, translations) {
  let jsonString = await json.stringify(translations)
  await fs.writeFile(translationsCache, jsonString)
}

async function retrieveFromStorage(cacheFile) {
  try {
    console.log('aa')
    let fileRawString = await fs.readFile(cacheFile)
    console.log('a', cacheFile)
    let fileString = fileRawString.toString()
    console.log(cacheFile, fileString)
    let translationsCache = await json.parse(fileString)
    console.log('parse')
    return translationsCache
  } catch (e) {
    console.error(e)
    return null
  }
}

module.exports = (options) => {
  options['cacheFile'] = options['cache']
  let { cacheFile } = options
  let translationsCache = null

  async function getTranslationFromCache(str, language) {
    if(!translationsCache) {
      try {
        console.log('retrieve')
        translationsCache = await retrieveFromStorage(cacheFile)
        translationsCache = translationsCache || {}
        console.log('translation cache', translationsCache)
      } catch {
        console.log('empty')
        translationsCache = {}
      }
    }
    return translationsCache[str]
  }

  async function cacheTranslations(translations) {
    return await storeToStorage(cacheFile, translations)
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
      .then(res => res.text)
  }

  return async function(original, language) {
    var translation = ""
    try {
      translation = await getTranslationFromCache(original, language) || await googleTranslate(original, language)
      if(translation == null) {
        console.error("Translation unavailable for '", original , "'")
      }
      await cacheTranslation(original, translation)
    } catch (e) {
      console.log(e)
    }
    return translation
  }
}