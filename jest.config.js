export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^firebase/(.*)$": "<rootDir>/src/__mocks__/firebase.js",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
};
