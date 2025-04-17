
module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/cards/user/:phoneNumber',
        handler: 'custom-card-controller.findByUser',
        config: {
          policies: [],
          middlewares: []
        },
      },
    ],
  };
  