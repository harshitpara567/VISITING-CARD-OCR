'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::lead.lead', ({ strapi }) => ({
  
  // Create a new lead with associated company details
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

      // Create a new company and associate it with the lead
      const company = await strapi.entityService.create('api::company.company', {
        data: {
          name: companyName,  // Mapped to 'name' in the company model
          address: companyAddress,  // Mapped to 'address'
          website: companyWebsite,  // Mapped to 'website'
        },
      });

      // Create the lead and link it to the user and company
      const newLead = await strapi.entityService.create('api::lead.lead', {
        data: {
          name,
          email,
          phoneNumber,
          designation,
          users_permissions_user: user,
          company: company.id,  // Linking the created company to the lead
        },
      });

      return newLead;
    } catch (error) {
      console.error("CREATE ERROR:", error);
      return ctx.throw(500, error.message);
    }
  },

  // Find one lead by ID and populate the user and company relationships
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
