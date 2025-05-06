'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/logs',
      handler: 'log.find',
      config: {
        auth: false  
      }
    },
  ]
};
