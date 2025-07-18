const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add SVG support
  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo")
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"]
  };

// Enable better hot reload and fast refresh
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Enable better caching for faster reloads
      if (req.url.endsWith('.bundle')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
      return middleware(req, res, next);
    };
  },
};

// Enable faster rebuilds
config.watchFolders = [
  ...config.watchFolders || [],
];

module.exports = withNativeWind(config, { input: './global.css' });
