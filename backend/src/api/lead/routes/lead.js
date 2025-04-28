'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/leads/:scannedCardId',
      handler: 'lead.findOne',
      config: {
        description: 'Get lead details by scannedCardId',
        tags: ['Leads'],
        parameters: [
          {
            name: 'scannedCardId',
            in: 'path',
            required: true,
            description: 'The ID of the scanned card',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Successfully retrieved lead details',
          },
          404: {
            description: 'Lead not found',
          },
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/leads',
      handler: 'lead.create',
      config: {
        description: 'Create a new lead entry',
        tags: ['Leads'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  companyName: { type: 'string' },
                  companyAddress: { type: 'string' },
                  companyWebsite: { type: 'string' },
                  email: { type: 'string' },
                  phoneNumber: { type: 'number' },
                  designation: { type: 'string' },
                  scannedCard: { type: 'string' },
                  user: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Lead created successfully',
          },
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
};
