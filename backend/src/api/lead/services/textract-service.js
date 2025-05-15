// src/api/lead/services/textract-service.js

const { TextractClient, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');
const { ComprehendClient, DetectEntitiesCommand } = require('@aws-sdk/client-comprehend');
const { parseTextData } = require('../../../utils/parse-text-data');

const textract = new TextractClient({ region: process.env.AWS_REGION });
const comprehend = new ComprehendClient({ region: process.env.AWS_REGION });

async function extractTextFromImage(buffer) {
  const command = new AnalyzeDocumentCommand({
    Document: { Bytes: buffer },
    FeatureTypes: ['FORMS'],
  });

  const response = await textract.send(command);

  const extractedText = response.Blocks
    .filter(block => block.BlockType === 'LINE')
    .map(block => block.Text)
    .join(' ');
    

  return extractedText;
}

async function analyzeEntities(text) {
 
  const command = new DetectEntitiesCommand({
    Text: text,
    LanguageCode: 'en'
  });

  try {
    const response = await comprehend.send(command);
    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error('Error analyzing entities: ' + response.$metadata.httpStatusCode);
    }
    
    return response.Entities;
  } catch (error) {
   
    return []; 
  }
}

async function analyzeDocumentAndParse(buffer) {
  const extractedText = await extractTextFromImage(buffer);
  const entities = await analyzeEntities(extractedText);
  const parsedData = parseTextData(entities);
  return parsedData;
}

module.exports = {
  extractTextFromImage,
  analyzeEntities,
  analyzeDocumentAndParse,
};
