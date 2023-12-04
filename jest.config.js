/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./__tests__/mocks/prisma-mock.ts'],
  testPathIgnorePatterns: ['mocks', '.test.d.ts', '.js']
};

