/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ['./tests/fixtures/setupTestDB.ts'],
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
  testTimeout: 30000,
};