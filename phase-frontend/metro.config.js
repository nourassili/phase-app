const { getDefaultConfig } = require("expo/metro-config");
const exclusionList = require("metro-config/src/defaults/exclusionList");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.blockList = exclusionList([/node_modules\/ws\/.*/]);

defaultConfig.resolver.extraNodeModules = {
  ...defaultConfig.resolver.extraNodeModules,
  ws: require.resolve("./wsStub.js"), // stub ws module
  stream: require.resolve("readable-stream"),
  crypto: require.resolve("react-native-crypto"),
  buffer: require.resolve("buffer"),
};

module.exports = defaultConfig;
