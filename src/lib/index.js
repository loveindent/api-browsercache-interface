require('babel-register');
const bindFunctionToRessource = require('./bindFunctionToRessource').default

module.exports = function(promise) {
  if (!promise) {
    promise = Promise
  }
  return class CacheAPI {
    constructor(ressources) {
      for (const key in ressources) {
        this[key] = bindFunctionToRessource(ressources[key], key, promise)
      }
    }
  }
}
