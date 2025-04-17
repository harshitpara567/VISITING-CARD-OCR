'use strict';

const { ValidationError } = require("@strapi/utils").errors; // eslint-disable-line no-unused-vars
const { createCoreController } = require('@strapi/strapi').factories;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
  },
    async login(ctx) {
      const { email, password } = ctx.request.body;
    
      // Check if email and password are provided
      if (!email || !password) {
        return ctx.badRequest('Email and password are required');
      }
    
      // Find the user by email
      console.log("Searching for user with email:", email);  // Debugging line
      // const users = await strapi.entityService("users-permissions.user").find({
      //   where: { email },
      // });
      const user  = await strapi.db.query("plugin::users-permissions.user").findOne({
        where: { email: email },
  });
      // const user = await strapi.services('plugin::users-permissions.user').findOne({
      //   where: { email },
      // });
    
      // If no user is found, return an error
      if (!user) {
        console.log("User not found!");  // Debugging line
        return ctx.badRequest('Invalid credentials');
      }
    
      // Compare the password with the stored hashed password
      console.log("Comparing passwords...");  // Debugging line
      console.log("Stored hashed password:", user.password);  // Debugging line
    
      const isValid = await bcrypt.compare(password, user.password);
      console.log("Password valid?", isValid);
    
      // If password is invalid, return an error
      if (!isValid) {
        console.log("Invalid password!");  // Debugging line
        return ctx.badRequest('Invalid credentials');
      }
    
      // Create a JWT token
      console.log("Generating JWT token...");  // Debugging line
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
      // Send the token and user data in the response
      console.log("Login successful, sending response with token and user data");  // Debugging line
      return ctx.send({ token, user });
    }

}));
