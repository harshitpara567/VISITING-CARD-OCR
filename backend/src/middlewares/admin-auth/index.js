'use strict';

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const authHeader = ctx.request.header.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return await next();
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = await strapi.admin.services.token.decodeJwtToken(token);
      const adminUser = await strapi.query('admin::user').findOne({ where: { id: decoded.id } });

      if (adminUser) {
        ctx.state.admin = adminUser;
      }
    } catch (err) {
      // Token is invalid or expired, just proceed without attaching admin
    }

    await next();
  };
};
