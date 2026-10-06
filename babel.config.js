module.exports = function (api) {
  api.cache(true);
  return {
    // O preset do Expo já inclui o plugin de worklets/reanimated.
    presets: ['babel-preset-expo'],
  };
};
