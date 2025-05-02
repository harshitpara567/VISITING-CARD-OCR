const { ComprehendClient } = require("@aws-sdk/client-comprehend");

require("dotenv").config(); 
const comprehend = new ComprehendClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = { comprehend };
