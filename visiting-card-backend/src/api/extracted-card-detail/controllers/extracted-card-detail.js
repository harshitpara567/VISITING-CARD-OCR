'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::extracted-card-detail.extracted-card-detail', ({ strapi }) => ({

  // This will be used for creating new extracted card details
  async create(ctx) {
    try {
      const { name, CompanyAddress, CompanyName, CompanyWebsite, email, Designation, phoneNumber, user } = ctx.request.body;

      const newCardDetail = await strapi.entityService.create('api::extracted-card-detail.extracted-card-detail', {
        data: {
          name,
          CompanyAddress,
          CompanyName,
          CompanyWebsite,
          email,
          Designation,
          phoneNumber,
          user: user, // relating user info
        },
      });

      return newCardDetail;
    } catch (error) {
      console.error("CREATE ERROR:", error);
      return ctx.throw(500, error.message);
    }
  },

  // This will be used to get extracted card detail by card id
  async findOne(ctx) {
    try {
      const { scannedCardId } = ctx.params;

      const cardDetail = await strapi.entityService.findOne('api::extracted-card-detail.extracted-card-detail', scannedCardId, {
        populate: ['user'], // Optional: populate related user info if needed
      });

      if (!cardDetail) return ctx.throw(404, 'Card detail not found');
      return cardDetail;
    } catch (error) {
      console.error("FINDONE ERROR:", error);
      return ctx.throw(500, error.message);
    }
  },

}));
