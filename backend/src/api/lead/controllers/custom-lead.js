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
    } catch (err) {
      try {
        // If fails, try Admin decoding
        const { auth } = await strapi.plugins['admin'].services.token.decodeJwtToken(token);
        userId = auth.id;
      } catch (error) {
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
    try {
      const { id } = ctx.params;
      const userId = id; 
  
      if (!userId) {
        return ctx.unauthorized('User not authenticated');
      }
  
      const leads = await strapi.entityService.findMany('api::lead.lead', {
        filters: {
          users_permissions_user: {
            id: userId,
          },
        },
        populate: ['company', 'scannedCard'], 
      });
  
      ctx.send(leads);
    } catch (error) {
      console.error('Error while fetching leads:', error);
      ctx.internalServerError('An error occurred while fetching leads');
    }
  },
  

  async login(ctx) {
    const { email, password } = ctx.request.body;
    if (!email || !password) return ctx.badRequest('Email and password are required');

    const user = await strapi.db.query("plugin::users-permissions.user").findOne({ where: { email } });
    if (!user) return ctx.badRequest('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return ctx.badRequest('Invalid credentials');

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return ctx.send({ token, user });
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
  
    const adminUserId = ctx.state.admin?.id || null;
  
    const savedEntry = await strapi.entityService.create('api::lead.lead', {
      data: {
        name: leadData?.name || null,
        email: leadData?.email || null,
        phoneNumber: leadData?.phoneNumber || null,
        designation: leadData?.designation || null,
        scannedCard: leadData?.scannedCard || null,
        created_by_admin: adminUserId
          ? { connect: [adminUserId] }
          : null,
        company: company?.id
          ? { connect: [company.id] }
          : null,
      },
      populate: ['company', 'created_by_admin'],
    });
  
    return savedEntry;
  }


  // async analyzeCardAndSave(ctx) {
  //   const { files } = ctx.request;
  //   if (!files?.scannedCard?.filepath) return ctx.throw(400, 'No scannedCard image uploaded');
  
  //   const filePath = files.scannedCard.filepath;
  //   const fileBuffer = fs.readFileSync(filePath);
  
  //   const rawText = await extractTextFromImage(fileBuffer);
  //   const entities = await analyzeEntities(rawText);
  //   const parsedData = parseTextData(entities, rawText);
    
  //   let user = ctx.state.user;
  
  //   // Check if the request is from an admin login (use the token from the header)
  //   if (!user) {
  //     const authHeader = ctx.request.header.authorization;
  //     if (!authHeader) return ctx.throw(401, 'Missing Authorization Header');
      
  //     const token = authHeader.split(' ')[1];
  
  //     try {
  //       // Decode the admin JWT token
  //       const { auth } = await strapi.plugins['admin'].services.token.decodeJwtToken(token);
  //       user = await strapi.query('plugin::users-permissions.user').findOne({ where: { id: auth.id } });
  //       ctx.state.user = user; // Set user to state so it's consistent
  //     } catch (err) {
  //       return ctx.throw(401, 'Invalid Token');
  //     }
  //   }
  
  //   if (!user) return ctx.throw(401, 'User is not authenticated');
  
  //   const { companyData, leadData } = parsedData;
  
  //   if (!companyData || !leadData) {
  //     return ctx.throw(400, 'Missing company or lead data from parsed text');
  //   }
  
  //   try {
  //     const company = await strapi.entityService.create('api::company.company', {
  //       data: {
  //         name: companyData?.name || null,
  //         address: companyData?.address || null,
  //         website: companyData?.website || null,
  //       },
  //     });
  
  //     const leadUserId = user?.id;
  
  //     const savedEntry = await strapi.entityService.create('api::lead.lead', {
  //       data: {
  //         name: leadData?.name || null,
  //         email: leadData?.email || null,
  //         phoneNumber: leadData?.phoneNumber || null,
  //         designation: leadData?.designation || null,
  //         scannedCard: leadData?.scannedCard || null,
  //         users_permissions_user: leadUserId ? { connect: [{ id: leadUserId }] } : null,
  //         company: company?.id ? { connect: [{ id: company.id }] } : null,
  //       },
  //       populate: ['company', 'users_permissions_user'],
  //     });
  
  //     return savedEntry;
  
  //   } catch (err) {
  //     return ctx.throw(500, `Error saving card data: ${err.message}`);
  //   }
  // }
  

}));
