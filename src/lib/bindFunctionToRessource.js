import lscache from 'lscache'
import pathToRegexp from 'path-to-regexp'
import _ from 'lodash'

export default function(ressource, key, promise) {
  return function(params, options) {
    // set bucket for ressources
    lscache.setBucket(key)

    // init params
    var query = _.get(options, 'query')
    var headers = _.get(options, 'headers')
    // get cache from path
    var cacheId = pathToRegexp.compile(ressource.path)(params)
    var cache = lscache.get(cacheId)

    // return cache if existing
    if (cache) {
      return new promise(function(resolve) {
        return resolve(cache)
      })
    }

    // verify request is a promise
    var request = ressource.request(cacheId, query, headers)

    if (!request || (typeof request !== 'object' && typeof request !== 'function') || typeof request.then !== 'function') {
      return new promise(function(resolve, reject) {
        return reject(new Error('REQUEST FUNCTION NOT A PROMISE'))
      })
    }

    return request.then(function(res, err) {
      if (err) {
        throw err
      }

      // flush cache for limitation
      lscache.flushBucketLimit(ressource.limit - 1)

      // set cache if not nocache enable
      if (_.get(options, 'nocache') != true) {
        lscache.set(cacheId, res, ressource.ttl)
      }

      return res
    }.bind(this))
  }
}
