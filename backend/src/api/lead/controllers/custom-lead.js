'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { extractTextFromImage, analyzeEntities } = require('../services/textract-service');
const { parseTextData } = require('../../../utils/parse-text-data');

module.exports = createCoreController('api::lead.lead', ({ strapi }) => ({
  
  async findMyCards(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.throw(401, 'Unauthorized');

    const entries = await strapi.db.query('api::lead.lead').findMany({
      where: { users_permissions_user: user.id },
      populate: ['users_permissions_user', 'company'],
    });

    if (!entries?.length) return ctx.throw(404, 'No records found for this user');
    return ctx.send({ data: entries });
  },

  async findByUserId(ctx) {
    const { userId } = ctx.params;

    const entries = await strapi.db.query('api::lead.lead').findMany({
      where: { users_permissions_user: { id: userId } },
      populate: ['users_permissions_user', 'company'],
    });

    if (!entries?.length) return ctx.throw(404, 'No records found for this user');
    return entries;
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
    const user = ctx.state.user;

    const { companyData, leadData } = parsedData;

    const company = await strapi.entityService.create('api::company.company', {
      data: {
        name: companyData?.name || null,
        address: companyData?.address || null,
        website: companyData?.website || null,
      },
    });

    const leadUserId = user?.id || null;

    const savedEntry = await strapi.entityService.create('api::lead.lead', {
      data: {
        name: leadData?.name || null,
        email: leadData?.email || null,
        phoneNumber: leadData?.phoneNumber || null,
        designation: leadData?.designation || null,
        scannedCard: leadData?.scannedCard || null,
        users_permissions_user: leadUserId
          ? { connect: [leadUserId] }
          : null,
        company: company?.id
          ? { connect: [company.id] }
          : null,
      },
      populate: ['company', 'users_permissions_user'],
    });

    return savedEntry;
  }

}));
