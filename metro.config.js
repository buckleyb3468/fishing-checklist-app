const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  const { assetExts } = defaultConfig.resolver;
  return {
    ...defaultConfig,
    transformer: {
      ...defaultConfig.transformer,
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      ...defaultConfig.resolver,
      assetExts: [...assetExts, 'svg', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ttf', 'otf'],
    },
  };
})();