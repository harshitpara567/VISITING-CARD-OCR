'use strict';

const { ValidationError } = require("@strapi/utils").errors; // eslint-disable-line no-unused-vars
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::card.card', ({ strapi }) => ({

  
  async findOne(ctx) {
    try {
      const { scannedCardId } = ctx.params;

      const card = await strapi.entityService.findOne('api::card.card', scannedCardId, {
        populate: ['user_info'], // optional: populate relations if needed
      });

      if (!card) return ctx.throw(404, 'Card not found');
      return card;
    } catch (error) {
      console.error("FINDONE ERROR:", error);
      return ctx.throw(500, error.message);
    }
  },

  // ✅ Create a new card
  async create(ctx) {
    try {
      const {
        name,
        companyAddress,
        CompanyName,
        CompanyWebsite,
        email,
        Designation,
        phoneNumber,
        user_info,
      } = ctx.request.body;

      const newCard = await strapi.entityService.create('api::card.card', {
        data: {
          name,
          companyAddress,
          CompanyName,
          CompanyWebsite,
          email,
          Designation,
          phoneNumber,
          user_info,
        },
      });

      return newCard;
    } catch (error) {
      console.error("CREATE ERROR:", error);
      return ctx.throw(500, error.message);
    }
  },

}));

