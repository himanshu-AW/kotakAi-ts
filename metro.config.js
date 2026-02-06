const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

module.exports = mergeConfig(defaultConfig, {
  transformer: {
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
      mangle: { toplevel: true },
      compress: { toplevel: true }
    },
    babelTransformerPath: require.resolve("react-native-svg-transformer/react-native")
  },
  resolver: {
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== "svg"),
    sourceExts: [...defaultConfig.resolver.sourceExts, "svg"]
  }
});
