// src/api/lead/services/textract-service.js

const { TextractClient, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');
const { ComprehendClient, DetectEntitiesCommand } = require('@aws-sdk/client-comprehend');
const { parseTextData } = require('../../../utils/parse-text-data');  // Import parseTextData function

const textract = new TextractClient({ region: process.env.AWS_REGION });
const comprehend = new ComprehendClient({ region: process.env.AWS_REGION });

async function extractTextFromImage(buffer) {
  // Extract text from the image using Textract's AnalyzeDocumentCommand
  const command = new AnalyzeDocumentCommand({
    Document: { Bytes: buffer },
    FeatureTypes: ['FORMS'],  // FeatureTypes for document analysis (forms are usually the relevant ones for business cards)
  });

  const response = await textract.send(command);
  
  // Return extracted text (joined as a single string)
  const extractedText = response.Blocks
    .filter(block => block.BlockType === 'LINE')
    .map(block => block.Text)
    .join(' ');

  return extractedText;
}

async function analyzeEntities(text) {
  // Use Comprehend to detect entities in the text
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

// New function to analyze the document and return parsed Lead and Company data
async function analyzeDocumentAndParse(buffer) {
  // Extract text from image
  const extractedText = await extractTextFromImage(buffer);
  
  // Analyze entities using Comprehend
  const entities = await analyzeEntities(extractedText);

  // Parse the extracted text and entities using your updated parseTextData function
  const parsedData = parseTextData(entities);

  // Return parsed data (for Lead and Company model use)
  return parsedData;
}

module.exports = {
  extractTextFromImage,
  analyzeEntities,
  analyzeDocumentAndParse,  // Export the new function to be used in your controller
};
