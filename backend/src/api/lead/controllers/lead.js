'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::lead.lead', ({ strapi }) => ({
  
  async create(ctx) {
    try {
      const {
        name,
        email,
        phoneNumber,
        designation,
        companyName,
        companyAddress,
        companyWebsite,
        user,
      } = ctx.request.body;

      const company = await strapi.entityService.create('api::company.company', {
        data: {
          name: companyName,
          address: companyAddress,
          website: companyWebsite,
        },
      });

      const newLead = await strapi.entityService.create('api::lead.lead', {
        data: {
          name,
          email,
          phoneNumber,
          designation,
          users_permissions_user: user,
          company: company.id,
        },
      });

      return newLead;
    } catch (error) {
      console.error("CREATE ERROR:", error);
      return ctx.throw(500, error.message);
    }
  },

  async findOne(ctx) {
    try {
      const { scannedCardId } = ctx.params;

      const lead = await strapi.entityService.findOne('api::lead.lead', scannedCardId, {
        populate: ['users_permissions_user', 'company'],
      });

      if (!lead) return ctx.throw(404, 'Lead not found');
      return lead;
    } catch (error) {
      console.error("FINDONE ERROR:", error);
      return ctx.throw(500, error.message);
    }
  }

}));
