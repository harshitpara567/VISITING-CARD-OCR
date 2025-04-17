
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
      {
        method: 'POST',
        path: '/custom-login',
        handler: 'custom-card-controller.login',
        config: {
          auth: false,
        },
      },
    ],
  };
  