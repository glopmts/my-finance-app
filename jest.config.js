module.exports = {
  preset: "jest-expo",
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "node_modules/(?!(expo|expo-(.*)|@expo|(react-native|react-native-(.*))|@react-native/(.*)|@react-native-community/(.*)))/",
  ],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
};
