'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/extracted-card-details/:scannedCardId',
      handler: 'extracted-card-detail.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/extracted-card-details',
      handler: 'extracted-card-detail.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
