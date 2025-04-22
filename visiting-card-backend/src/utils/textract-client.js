require('dotenv').config(); 
const { TextractClient, AnalyzeDocumentCommand } = require("@aws-sdk/client-textract");

const textractClient = new TextractClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// eslint-disable-next-line no-unused-vars
const analyzeDocument = async (bytes) => {
  const params = {
    Document: { Bytes: bytes },
    FeatureTypes: ["FORMS"],
  };

  const command = new AnalyzeDocumentCommand(params);
  const response = await textractClient.send(command);
  return response;
};

module.exports = { textractClient, AnalyzeDocumentCommand };
