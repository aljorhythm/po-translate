/**
 * Translation abstraction
 * Use free google-translate-api if available. A cache
 * is implemented
 */
let googleTranslateAPI = require('google-translate-api')
const fs = require('fs-extra')
const json = require('json-promise')
const jsonPrinter = require('format-json')

async function storeToStorage(translationsCache, translations) {
  let prettyString = jsonPrinter.plain(translations)
  await fs.writeFile(translationsCache, prettyString)
}

async function retrieveFromStorage(cacheFile) {
  try {
    let fileRawString = await fs.readFile(cacheFile)
    let fileString = fileRawString.toString()
    let translationsCache = await json.parse(fileString)
    return translationsCache
  } catch (e) {
    return null
  }
}

module.exports = (options) => {
  options['cacheFile'] = options['cache']
  let {
    cacheFile
  } = options
  let translationsCache = null

  async function getTranslationFromCache(str, language) {
    if (!translationsCache) {
      try {
        translationsCache = await retrieveFromStorage(cacheFile)
      } finally {}
      translationsCache = translationsCache || {}
    }
    return translationsCache[str]
  }

  async function cacheTranslations(translations) {
    return await storeToStorage(cacheFile, translations)
  }

  async function cacheTranslation(original, translation, language) {
    if (!translationsCache) {
      translationsCache = {}
    }
    translationsCache[original] = translation
    return await cacheTranslations(translationsCache)
  }

  async function googleTranslate(str, language) {
    return googleTranslateAPI(str, {
        to: language
      })
      .then(res => res.text)
  }

  function sanitizeSprintF(translation) {
    return translation.replace("％", "%")
  }

  function sanitizeTranslation(translation) {
    return sanitizeSprintF(translation)
  }

  return async function (original, language) {
    var translation = null
    try {
      translation = await getTranslationFromCache(original, language)
      if (!translation) {
        translation = await googleTranslate(original, language)
        translation = await sanitizeTranslation(translation)
        await cacheTranslation(original, translation)      
      }
    } catch (e) {
      throw e
    }
    return translation || ""
  }
}