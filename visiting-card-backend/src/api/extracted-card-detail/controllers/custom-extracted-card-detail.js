'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { extractTextFromImage, analyzeEntities } = require('../services/textract-service');

const { parseTextData } = require('../../../utils/parse-text-data');
const fs = require('fs');

module.exports = createCoreController('api::extracted-card-detail.extracted-card-detail', ({ strapi }) => ({

  async findByPhoneNumber(ctx) {
    try {
      const { phoneNumber } = ctx.params;

      const entries = await strapi.db.query('api::extracted-card-detail.extracted-card-detail').findMany({
        where: {
          phoneNumber: phoneNumber, 
        },
        populate: ['users_permissions_user'], 
      });

      if (!entries || entries.length === 0) {
        return ctx.throw(404, 'No records found for this phoneNumber');
      }

      return entries;
    } catch (error) {
      console.error("FIND_BY_PHONE_NUMBER ERROR:", error);
      return ctx.throw(500, error.message);
    }
  },

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
      const parsedData = parseTextData(entities,rawText);
  

      const user = ctx.state.user;
      if (user) parsedData.users_permissions_user = user.id;
  
      const savedEntry = await strapi.entityService.create('api::extracted-card-detail.extracted-card-detail', {
        data: parsedData,
      });

        // for (const key in savedEntry) {
        //     if (savedEntry.hasOwnProperty(key) && savedEntry[key] === null) {
        //         if (element.includes('@') && element.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)) {
        //             savedEntry.email = element
        //         } else if (element.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/)) {
        //             savedEntry.phoneNumber = element.replace(/\D/g, '')
        //         } else if (element.match(/^(Founder|Co[- ]?Founder|CEO|Chief Executive Officer|CTO|Chief Technology Officer|COO|Chief Operating Officer|CFO|Chief Financial Officer|Manager|Product Manager|Project Manager|Director|Software Engineer|Developer|Engineer|Designer|Consultant|Analyst|Intern|President|Vice President|VP|Lead|Head)\b/i)) {
        //             savedEntry.Designation = element
        //         } else if (element.match(/((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/[^\s]*)?/gi)) {
        //             savedEntry.CompanyWebsite = element
        //         }else if (element.match(/\b([A-Z][a-zA-Z&,\.\- ]+(Inc|LLC|Ltd|Corporation|Company|Corp|Solutions|Technologies|Systems|Group|Studio|Associates|Agency|Services))\b/)) {
        //             savedEntry.CompanyName = element
        //         }
        //     }
        //   }
      return savedEntry;
    } catch (err) {
      console.error("ANALYZE_CARD_ERROR:", err);
      return ctx.throw(500, err.message);
    }
  }
  
}));
