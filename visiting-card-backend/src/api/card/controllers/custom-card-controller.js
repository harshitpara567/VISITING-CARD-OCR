'use strict';

const { ValidationError } = require("@strapi/utils").errors; // eslint-disable-line no-unused-vars
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::card.card', ({ strapi }) => ({

  async findByUser(ctx) {
    try {
      const { phoneNumber } = ctx.params;

      const cards = await strapi.entityService.findMany('api::card.card', {
        filters: { phoneNumber },
        populate: ['user_info'], // Optional: include if you want related user_info
      });

      if (!cards || cards.length === 0) {
        return ctx.throw(404, 'No cards found for this user');
      }

      // Return just the first card found (you can change this if you want to return all)
      return cards[0];
    } catch (error) {
      console.error("FIND_BY_USER ERROR:", error);
      return ctx.throw(500, error.message);
    }
  }

}));
