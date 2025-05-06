'use strict';

module.exports = {
  async createLog({ action, entityName, entityId, userId, additionalInfo = {} }) {
    try {
      await strapi.entityService.create('api::log.log', {
        data: {
          action,
          entityName,
          entityId,
          user: userId,
          additionalInfo,
        },
      });
    } catch (error) {
      strapi.log.error('Error creating log:', error);
    }
  },
};
