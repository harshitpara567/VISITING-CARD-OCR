module.exports = async (ctx, next) => {
    // Allow admin users to assign any role
    if (ctx.state?.user?.isAdmin || ctx.state?.user?.roles?.includes('Super Admin')) {
      return await next();
    }
  
    // Otherwise, run normal role assignment checks
    const { role } = ctx.request.body;
  
    if (!role) {
      return await next();
    }
  
    const foundRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { id: role } });
  
    if (!foundRole) {
      return ctx.unauthorized('Cannot assign role that does not exist.');
    }
  
    return await next();
  };
  