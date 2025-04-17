// 'use strict';

// /**
//  * card router
//  */

// const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('api::card.card');
module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/cards/:scannedCardId',
        handler: 'card.findOne', // comes from controllers/card.js
        config: {
          policies: [],
        },
      },
      {
        method: 'POST',
        path: '/cards',
        handler: 'card.create', // also from controllers/card.js
        config: {
          policies: [],
        },
      },
    ],
  };
  