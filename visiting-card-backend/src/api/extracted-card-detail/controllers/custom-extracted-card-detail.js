'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { extractTextFromImage, analyzeEntities } = require('../services/textract-service');
const { parseTextData } = require('../../../utils/parse-text-data');
const fs = require('fs');

module.exports = createCoreController('api::extracted-card-detail.extracted-card-detail', ({ strapi }) => ({

  // Fetch scanned cards for the currently logged-in user
  async findMyCards(ctx) {
    try {
      const user = ctx.state.user;  // Get the logged-in user from the context

      if (!user) {
        return ctx.throw(401, 'Unauthorized');  // If no user is logged in, return 401
      }

      const entries = await strapi.db.query('api::extracted-card-detail.extracted-card-detail').findMany({
        where: {
          users_permissions_user: user.id,  // Filter by the logged-in user's ID
        },
        populate: ['users_permissions_user'],
      });

      if (!entries || entries.length === 0) {
        return ctx.throw(404, 'No records found for this user');
      }

      return entries;
    } catch (error) {
      console.error("FIND_MY_CARDS ERROR:", error);
      return ctx.throw(500, error.message);  // Handle any server errors
    }
  },

  // Fetch scanned cards for a specific user by userId
  async findByUserId(ctx) {
    try {
      const { userId } = ctx.params;  // Get userId from URL params

      const entries = await strapi.db.query('api::extracted-card-detail.extracted-card-detail').findMany({
        where: {
          users_permissions_user: {
            id: userId,  // Filter by userId
          },
        },
        populate: ['users_permissions_user'],
      });

      if (!entries || entries.length === 0) {
        return ctx.throw(404, 'No records found for this user');
      }

      return entries;
    } catch (error) {
      console.error("FIND_BY_USER_ID ERROR:", error);
      return ctx.throw(500, error.message);
    }
  },

  // User login logic
  async login(ctx) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
      return ctx.badRequest('Email and password are required');
    }

    console.log("Searching for user with email:", email);  // Debugging line

    const user = await strapi.db.query("plugin::users-permissions.user").findOne({
      where: { email: email },
    });

    if (!user) {
      console.log("User not found!");
      return ctx.badRequest('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log("Password valid?", isValid);

    if (!isValid) {
      console.log("Invalid password!");
      return ctx.badRequest('Invalid credentials');
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log("Login successful, sending response with token and user data");
    return ctx.send({ token, user });
  },

  // Mark a scanned card as favorite or not
  async markFavorite(ctx) {
    try {
      const { id } = ctx.params;

      const body = ctx.request.body;
      if (!body || typeof body !== 'object') {
        return ctx.throw(400, 'Request body is missing or invalid');
      }

      const { isFavorite } = body.data || {}; // Optional chaining

      if (typeof isFavorite !== 'boolean') {
        return ctx.throw(400, 'Invalid or missing isFavorite boolean value');
      }

      const updated = await strapi.entityService.update('api::extracted-card-detail.extracted-card-detail', id, {
        data: { isFavorite },
      });

      return updated;
    } catch (error) {
      console.error("MARK_FAVORITE_ERROR:", error);
      return ctx.throw(500, error.message);
    }
  },

  // Analyze a scanned card image and save the extracted data
  async analyzeCardAndSave(ctx) {
    try {
      const { files } = ctx.request;

      if (!files || !files.scannedCard || !files.scannedCard.filepath) {
        return ctx.throw(400, 'No scannedCard image uploaded');
      }

      const filePath = files.scannedCard.filepath;
      const fileBuffer = fs.readFileSync(filePath);

      const rawText = await extractTextFromImage(fileBuffer);
      const entities = await analyzeEntities(rawText);
      const parsedData = parseTextData(entities, rawText);

      const user = ctx.state.user;
      if (user) parsedData.users_permissions_user = user.id;

      const savedEntry = await strapi.entityService.create('api::extracted-card-detail.extracted-card-detail', {
        data: parsedData,
      });
      return savedEntry;
    } catch (err) {
      console.error("ANALYZE_CARD_ERROR:", err);
      return ctx.throw(500, err.message);
    }
  }
}));
