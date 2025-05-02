'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { extractTextFromImage, analyzeEntities } = require('../services/textract-service');
const { parseTextData } = require('../../../utils/parse-text-data');

module.exports = createCoreController('api::lead.lead', ({ strapi }) => ({
  
  async findMyCards(ctx) {
    let userId = null;
  
    const authHeader = ctx.request.header.authorization;
    if (!authHeader) return ctx.throw(401, 'Missing Authorization Header');
  
    const token = authHeader.split(' ')[1];
  
    try {
      // Try Users-Permissions decoding first
      const user = await strapi.plugins['users-permissions'].services.jwt.getToken(ctx);
      userId = user.id;
    } catch {
      try {
        // If fails, try Admin decoding
        const { auth } = await strapi.plugins['admin'].services.token.decodeJwtToken(token);
        userId = auth.id;
      } catch {
        return ctx.throw(401, 'Invalid Token');
      }
    }
  
    if (!userId) return ctx.throw(401, 'Unauthorized');
  
    // Now fetch leads (filtered if you want)
    const entries = await strapi.db.query('api::lead.lead').findMany({
      where: { created_by_admin: userId },
      populate: ['company', 'created_by_admin'],
    });
  
    if (!entries?.length) {
      return ctx.throw(404, 'No records found');
    }
  
    return ctx.send({ data: entries });
  },
  

  async findByUserId(ctx) {
    const { userId } = ctx.params;
  
    if (!userId) {
      return ctx.throw(400, 'User ID is required');
    }
  
    try {
      const leads = await strapi.db.query('api::lead.lead').findMany({
        where: {
          users_permissions_user: {
            id: userId, 
          },
        },
        populate: ['company'], 
      });
  
      return leads; 
    } catch {
      return ctx.throw(500, 'Error fetching leads');
    }
  },
  

  async login(ctx) {
    const { email, password } = ctx.request.body;
  
    const user = await strapi.db.query('admin::user').findOne({ where: { email } });
  
    if (!user) {
      return ctx.unauthorized('Invalid email or password');
    }
  
    const isValid = await bcrypt.compare(password, user.password);
  
    if (!isValid) {
      return ctx.unauthorized('Invalid email or password');
    }
  
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
    return ctx.send({
      token,
      user
    });
  },
  

  async markFavorite(ctx) {
    const { id } = ctx.params;
    const { isFavorite } = ctx.request.body?.data || {};

    if (typeof isFavorite !== 'boolean') return ctx.throw(400, 'Invalid or missing isFavorite value');

    await strapi.entityService.update('api::lead.lead', id, {
      data: { isFavorite },
    });

    const updated = await strapi.entityService.findOne('api::lead.lead', id, {
      populate: ['company'],
    });

    return updated;
  },
  
  async analyzeCardAndSave(ctx) {
    const { files } = ctx.request;
    const userId = ctx.params.userId; 
    if (!userId) return ctx.throw(400, 'User ID is required');
    if (!files?.scannedCard?.filepath) return ctx.throw(400, 'No scannedCard image uploaded');

    const filePath = files.scannedCard.filepath;
    const fileBuffer = fs.readFileSync(filePath);

    const rawText = await extractTextFromImage(fileBuffer);
    const entities = await analyzeEntities(rawText);
    const parsedData = parseTextData(entities, rawText);

    const { companyData, leadData } = parsedData;

    const company = await strapi.entityService.create('api::company.company', {
      data: {
        name: companyData?.name || null,
        address: companyData?.address || null,
        website: companyData?.website || null,
      },
    });

    const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);

    if (!user) {
      return ctx.throw(404, 'User not found');
    }

    const savedEntry = await strapi.entityService.create('api::lead.lead', {
      data: {
        name: leadData?.name || null,
        email: leadData?.email || null,
        phoneNumber: leadData?.phoneNumber || null,
        designation: leadData?.designation || null,
        scannedCard: leadData?.scannedCard || null,
        users_permissions_user: user.id, 
        company: company?.id || null, 
      },
      populate: ['company', 'users_permissions_user'],
    });

    return savedEntry;
  },

  async getLeadsByUser(ctx) {
    const { userDocumentId } = ctx.params;
  
    if (!userDocumentId) {
      return ctx.throw(400, 'User document ID is required');
    }
  
    try {
      const leads = await strapi.db.query('api::lead.lead').findMany({
        where: {
          users_permissions_user: {
            id: userDocumentId,  
          },
        },
        populate: ['company'],  
      });
  
      return leads;
    } catch {
      return ctx.throw(500, 'Error fetching leads');
    }
  }
}));
