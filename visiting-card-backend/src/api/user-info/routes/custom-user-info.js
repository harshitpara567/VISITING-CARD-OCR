module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/custom-signup',
      handler: 'custom-user-info.signup',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/custom-login',
      handler: 'custom-user-info.login',
      config: {
        auth: false,
      },
    },
  ],
};
