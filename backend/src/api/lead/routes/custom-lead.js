'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/leads/user/:userId',
      handler: 'custom-lead.findByUserId', 
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

    {
      method: 'POST',
      path: '/leads/analyze/:userId', 
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
  ],
};
