import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  clearMocks: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./__tests__/mocks/prisma-singleton.ts'],
  testPathIgnorePatterns: [
    './lib/',
    './__tests__/mocks/',
    './__tests__/seed-database.ts',
    './__tests__/teardown-database.ts',
  ],
  testNamePattern: '.test.ts',
};

export default config;

