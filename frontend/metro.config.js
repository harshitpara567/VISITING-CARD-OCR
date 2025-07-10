const { getDefaultConfig } = require('@expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = getDefaultConfig(__dirname);

// 🔥 Block bundling of yargs and other problematic modules
config.resolver.blockList = exclusionList([
  /node_modules\/yargs\/.*/,
  /node_modules\/fs\/.*/,
  /node_modules\/assert\/.*/,
]);

module.exports = config;
