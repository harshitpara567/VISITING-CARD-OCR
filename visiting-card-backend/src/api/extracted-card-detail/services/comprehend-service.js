const { DetectEntitiesCommand } = require("@aws-sdk/client-comprehend");
const comprehend = require("../../../utils/comprehend-client");

const analyzeEntities = async (text) => {
  const command = new DetectEntitiesCommand({
    Text: text,
    LanguageCode: "en",
  });

  const response = await comprehend.send(command);
  return response.Entities;
};

module.exports = { analyzeEntities };
