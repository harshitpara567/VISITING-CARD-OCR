'use strict';

module.exports = {
  routes: [
    // Route to get all leads for a specific user by userId
    {
      method: 'GET',
      path: '/leads/user/:userId',
      handler: 'custom-lead.findByUserId', // The controller function to fetch leads by userId
      config: {
        description: 'Get all leads for a specific user by userId',
        tags: ['Leads'],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'ID of the user',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'List of leads returned successfully' },
        },
        policies: [],
        middlewares: [],
      },
    },

    // Custom login route
    {
      method: 'POST',
      path: '/custom-login',
      handler: 'custom-lead.login',
      config: {
        description: 'Custom login endpoint returning token on success',
        tags: ['Authentication'],
        responses: {
          200: { description: 'Login successful, token returned' },
          401: { description: 'Invalid credentials' },
        },
        auth: false,
      },
    },

    // Route to analyze card and save leads
    {
      method: 'POST',
      path: '/leads/analyze/:userId', // Change from :userDocumentId to :userId
      handler: 'custom-lead.analyzeCardAndSave',
      config: {
        description: 'Upload a card image and extract text using AWS Textract & Comprehend',
        tags: ['Leads'],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'ID of the user (users_permissions_user id)',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  scannedCard: {
                    type: 'string',
                    format: 'binary',
                    description: 'Card image to analyze',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Card processed and saved successfully' },
        },
        policies: [],
        middlewares: [],
      },
    },
    

    // Route to mark a lead as favorite
    {
      method: 'PUT',
      path: '/leads/:id/favorite',
      handler: 'custom-lead.markFavorite',
      config: {
        description: 'Mark a lead as favorite by its ID',
        tags: ['Leads'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the lead to mark as favorite',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Lead marked as favorite' },
        },
        policies: [],
        middlewares: [],
      },
    },

    // Route to get all leads for the logged-in user
    {
      method: 'GET',
      path: '/myleads',
      handler: 'custom-lead.findMyCards',
      config: {
        description: 'Get all leads for the logged-in user',
        tags: ['Leads'],
        responses: {
          200: { description: 'User’s leads returned successfully' },
        },
        policies: [],
        middlewares: [],
      },
    },

    // Route to get lead and company by user document ID
    // {
    //   method: 'GET',
    //   path: '/lead-company/:userDocumentId',
    //   handler: 'custom-lead.getLeadAndCompanyByUserDocumentId',
    //   config: {
    //     description: 'Get lead and company by user document ID',
    //     tags: ['Lead', 'Company'],
    //     responses: {
    //       200: { description: 'Successfully fetched lead and company data' },
    //       400: { description: 'User document ID missing' },
    //       404: { description: 'No lead found for this user' },
    //     },
    //     auth: false, // Ensure this is correct based on your authentication
    //   },
    // },
  ],
};
