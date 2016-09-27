# API Browser Cache Interface


A little interface for API with a localStorage implementation

<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Features](#features)
- [How to use](#how-to-use)

<!-- /TOC -->

# Features
- Implement your API with a localStorage
- Choose your own Promise library
- Put limit on localStorage for each ressources

# How to use
```js
// definition
var Promise = require('bluebird')
var CacheAPI = require('api-browsercache-interface')(Promise)

const usersAPI = new CacheAPI({
  find: {
    path: '/users',
    ttl: '1h',
    limit: 1,
    request: function(url, query, header) {
      // put your request here
    }
  },
  findById: {
    path: '/users/:id',
    ttl: '3h',
    limit: 10,
    request: function(url, query, header) {
      // put your request here
    }
  }
});

// utilisation
usersAPI.find();
usersAPI.getUserById({ id: '1234' }, {query: /* queries */, 
                                      headers: /* headers */, 
                                      nocache: /* true|false */});

```
