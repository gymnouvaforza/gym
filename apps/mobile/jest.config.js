module.exports = {
  preset: "jest-expo",
  rootDir: ".",
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  testPathIgnorePatterns: ["<rootDir>/app/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@mobile-contracts$": "<rootDir>/../../packages/mobile-contracts/src/index.ts",
    "^@mobile-contracts/(.*)$": "<rootDir>/../../packages/mobile-contracts/src/$1",
    "\\.(css)$": "<rootDir>/test/style-mock.js",
  },
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/test/**",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(?:-community)?|expo(?:nent)?|@expo(?:nent)?/.*|@expo/.*|expo-router|@react-navigation/.*|react-native-svg|nativewind|react-native-css-interop|lucide-react-native|@shopify/flash-list))",
  ],
};
