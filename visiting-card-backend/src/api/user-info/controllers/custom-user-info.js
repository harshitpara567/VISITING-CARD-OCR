'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
  async signup(ctx) {
    const { fullName, phoneNumber, email, password } = ctx.request.body;

    if (!fullName || !phoneNumber || !email || !password) {
      return ctx.badRequest('All fields are required');
    }

    const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email },
    });

    if (existingUser) {
      return ctx.badRequest('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);

    const newUser = await strapi.entityService.create('api::user-info.user-info', {
      data: {
        fullName,
        phoneNumber,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return ctx.send({ token, user: newUser });
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
};
