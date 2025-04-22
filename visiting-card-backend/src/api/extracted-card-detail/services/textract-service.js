// src/api/extracted-card-detail/services/textract-service.js

const { TextractClient, DetectDocumentTextCommand } = require('@aws-sdk/client-textract');
const { ComprehendClient, DetectEntitiesCommand } = require('@aws-sdk/client-comprehend');

const textract = new TextractClient({ region: process.env.AWS_REGION });
const comprehend = new ComprehendClient({ region: process.env.AWS_REGION });

async function extractTextFromImage(buffer) {
  const command = new DetectDocumentTextCommand({
    Document: { Bytes: buffer },
  });

  const response = await textract.send(command);
  const lines = response.Blocks
    .filter(block => block.BlockType === 'LINE')
    .map(block => block.Text);

  return lines.join(' ');
}

async function analyzeEntities(text) {
  const command = new DetectEntitiesCommand({
    Text: text,
    LanguageCode: 'en'
  });

  const response = await comprehend.send(command);
  if (response.$metadata.httpStatusCode !== 200) {
    throw new Error('Error analyzing entities: ' + response.$metadata.httpStatusCode);
  }
  return response.Entities;
}

module.exports = {
  extractTextFromImage,
  analyzeEntities
};
