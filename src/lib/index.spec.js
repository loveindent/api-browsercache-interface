import {expect} from 'chai';
import Promise from 'bluebird';
import lscache from 'lscache';
import m from './index.js';
var CacheAPI = m(Promise);

describe('api browsercache interface', function() {
  lscache.flush()
  var gamesAPI = new CacheAPI({
    'find': {
      path: '/games',
      ttl: '1min',
      limit: 1,
      request: function(url, query, header) {  // eslint-disable-line no-unused-vars
        return {
          'FFXV': {
            name: 'Final Fantasy XV',
            genre: 'RPG'
          },
          'P5': {
            name: 'Persona 5',
            genre: 'RPG'
          }
        }
      }
    },
    'badGames': {
      path: '/bad/:id/games',
      ttl: '1min',
      limit: 1,
      request: function(url, query, header) {  // eslint-disable-line no-unused-vars
        return new Promise(function(resolve, reject) {
          return reject(new Error('error web'));
        })
      }
    },
    'getGamesById': {
      path: '/games/:id',
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
        })
      }
    }
  });

  var usersAPI = new CacheAPI({
    'getUserById': {
      path: '/users/:id',
      ttl: '1min',
      limit: 3,
      request: function(url, query, header) {  // eslint-disable-line no-unused-vars
        return new Promise(function(resolve) {
          if (query === 1) {
            return resolve(url);
          }
          else {
            return resolve('test')
          }
        })
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
        })
      }
    }
  });

  it('should return expected data from users API', function(done) {
    usersAPI.getUserById({ id: '1_JOURS' }, { query: 1 }).then(function(res) {
      expect(res).to.be.equal('/users/1_JOURS')
      done()
    }).catch(function(err) {
      done(err)
    })
  })

  it('should return expected data from games API', function(done) {
    gamesAPI.getGamesById({ id: 'FFXV' }, { query: 1 }).then(function(res) {
      expect(res).to.be.equal('/games/FFXV')
      done()
    }).catch(function(err) {
      done(err)
    })
  })

  it('should return cached data', function(done) {
    usersAPI.getUserById({id: '1_JOURS'}).then(function(res) {
      expect(res).to.be.equal('/users/1_JOURS')
      done()
    }).catch(function(err) {
      done(err)
    });
  })

  it('should limit userbyid to 3 ressources cached data', function(done) {
    usersAPI.getUserById({id: '2_SEMAINES'}, { query: 1 })
    usersAPI.getUserById({id: '3_MOIS'}, { query: 1 })
    usersAPI.getUserById({id: '4_ANS'}, { query: 1 })
    setTimeout(function() {
      usersAPI.getUserById({id: '1_JOURS'})
        .then(function(res) {
          expect(res).to.be.equal('test')
          done()
        }).catch(function(err) {
          done(err)
        })
      ;
    }, 500)
  });

  it('should return an error if request is not returning a promise', function(done) {
    gamesAPI.find().then(function(res) {
      done(res)
    }).catch(function(err) {
      expect(err)
      done()
    })
  })

  it('should return an error if the request is bad', function(done) {
    gamesAPI.badGames({ id: '6789' }, { query: 1}).then(function(res) {
      done(res)
    }).catch(function(err) {
      expect(err)
      done()
    })
  })

  it('should not save cache if nocache is true', function(done) {
    gamesAPI.getGamesById({ id: '12345' }, { query: 1, nocache: true })
    setTimeout(function() {
      gamesAPI.getGamesById({id: '12345'})
        .then(function(res) {
          expect(res).to.be.equal('test')
          done()
        }).catch(function(err) {
          done(err)
        })
      ;
    }, 500)
  })
})
