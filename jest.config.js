module.exports = {
  verbose: true,
  maxWorkers: 1,
  collectCoverageFrom: [
    "domain/**/*.ts",
    "external/**/*.ts",
    "repository/**/*.ts",
    "store/**/*.ts",
    "utils/**/*.ts",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^~/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/components/",
    "/pages/",
  ],
};
