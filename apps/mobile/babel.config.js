module.exports = function (api) {
  const isTest = api.env("test");
  api.cache(false);

  return {
    presets: isTest ? ["babel-preset-expo"] : ["babel-preset-expo", "nativewind/babel"],
    plugins: isTest
      ? []
      : [
          [
            "module-resolver",
            {
              alias: {
                "@": "./src",
                "@mobile-contracts": "../../packages/mobile-contracts/src",
              },
            },
          ],
          "react-native-reanimated/plugin",
        ],
  };
};
