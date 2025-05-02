require('dotenv').config();
const { TextractClient, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');
const { parseTextData } = require('./parse-text-data');

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
  
  const textractText = response.Blocks
    .filter(block => block.BlockType === 'LINE')
    .map(block => block.Text)
    .join(' ');

  const parsedData = parseTextData(response.Blocks);

  return {
    textractText,
    parsedData,
  };
};

module.exports = { textractClient, analyzeDocument };
