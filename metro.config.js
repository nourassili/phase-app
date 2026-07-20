const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Keep Metro scoped to the Expo app — ignore the Cloudflare Worker package.
config.projectRoot = projectRoot;
config.watchFolders = [projectRoot];
config.resolver.blockList = [
  ...(config.resolver.blockList ?? []),
  new RegExp(path.join(projectRoot, 'thread-backend').replace(/[/\\]/g, '[/\\\\]') + '[/\\\\].*'),
];

module.exports = config;
