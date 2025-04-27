// src/api/utils/textract-client.js

require('dotenv').config(); 
const { TextractClient, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');
const { parseTextData } = require('./parse-text-data'); // Import parseTextData

const textractClient = new TextractClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const analyzeDocument = async (bytes) => {
  const params = {
    Document: { Bytes: bytes },
    FeatureTypes: ['FORMS'],
  };

  const command = new AnalyzeDocumentCommand(params);
  const response = await textractClient.send(command);
  
  // Extracting the detected entities from the Textract response
  const textractText = response.Blocks
    .filter(block => block.BlockType === 'LINE')
    .map(block => block.Text)
    .join(' ');

  // Use Comprehend to analyze the text extracted by Textract
  const parsedData = parseTextData(response.Blocks);  // Pass the Textract response to parseTextData

  return {
    textractText,
    parsedData,  // Return the parsed data with both Lead and Company details
  };
};

module.exports = { textractClient, analyzeDocument };
