'use strict';

module.exports = {
  routes: [
    // Route for fetching the scanned cards of a specific user by userId
    {
      method: 'GET',
      path: '/scannedcards/user/:userId',
      handler: 'custom-extracted-card-detail.findByUserId',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    
    // Route for logging in and getting a JWT token
    {
      method: 'POST',
      path: '/custom-login',
      handler: 'custom-extracted-card-detail.login',
      config: {
        auth: false,  // Disable authentication for this endpoint
      },
    },
    
    // Route for uploading a scanned card, analyzing it, and saving the data
    {
      method: 'POST',
      path: '/scannedcards/analyze',
      handler: 'custom-extracted-card-detail.analyzeCardAndSave',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // Route for marking a scanned card as favorite
    {
      method: 'PUT',
      path: '/scannedcards/:id/favorite',
      handler: 'custom-extracted-card-detail.markFavorite',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    // Route for fetching the current user's cards (my cards) - No authentication needed
    {
      method: 'GET',
      path: '/mycards',
      handler: 'custom-extracted-card-detail.findMyCards',
      config: {
        policies: [], // No authentication policy here
        middlewares: [],
      },
    }
  ],
};
