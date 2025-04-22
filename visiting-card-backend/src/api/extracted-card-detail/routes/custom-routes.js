'use strict';

module.exports = {
  routes: [
    {
        method: 'GET',
        path: '/scannedcards/:phoneNumber',
        handler: 'custom-extracted-card-detail.findByPhoneNumber',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/custom-login',
      handler: 'custom-extracted-card-detail.login',  // Same as before for login functionality
      config: {
        auth: false, // Disable authentication for this endpoint
      },
    },
    {
        method: 'POST',
        path: '/scannedcards/analyze',
        handler: 'custom-extracted-card-detail.analyzeCardAndSave',
        config: {
          policies: [],
          middlewares: [],
        },
      },
  ],
};
