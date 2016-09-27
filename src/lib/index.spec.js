import {expect} from 'chai';
import Promise from 'bluebird';
import m from './index.js';
var CacheAPI = m(Promise);

describe('constructor', function() {
  var usersAPI = new CacheAPI({
    'getUserById': {
      path: '/users/:id',
      ttl: '1min',
      limit: 4,
      request: function(url, query, header) {  // eslint-disable-line no-unused-vars
        return new Promise(function(resolve) {
          if (query === 1) {
            return resolve(url);
          }
          else {
            return resolve('test')
          }
        });
      }
    },
    'getUserByName': {
      path: '/users/:id',
      ttl: '1min',
      limit: 4,
      request: function(url, query, header) {  // eslint-disable-line no-unused-vars
        return new Promise(function(resolve, reject) {
          if (url) {
            return resolve(url);
          }

          return reject(new Error('error web'));
        });
      }
    }
  });

  it('should return expected data', function(done) {
    usersAPI.getUserById({ id: '1_JOURS' }, { query: 1 }).then(function(res) {
      expect(res).to.be.equal('/users/1_JOURS')
      done()
    }).catch(function(err) {
      done(err)
    })

    setTimeout(function() {
      usersAPI.getUserById( { id: '2_SEMAINES' } );
    }, 1000)
    setTimeout(function() {
      usersAPI.getUserById( { id: '3_MOIS' } );
    }, 2000)
  })

  it('should return cached data', function(done) {
    usersAPI.getUserById({id: '1_JOURS'}).then(function(res) {
      expect(res).to.be.equal('/users/1_JOURS')
      done()
    }).catch(function(err) {
      done(err)
    });
  })
})
