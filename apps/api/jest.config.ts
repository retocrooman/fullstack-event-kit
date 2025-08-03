import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  verbose: true,
  coverageReporters: ['text'],
  projects: [
    // Unit tests configuration
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: '@quramy/jest-prisma-node/environment',
      testMatch: ['<rootDir>/src/**/*.spec.ts'],
      testPathIgnorePatterns: ['.integration.spec.ts'],
      collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/main.ts'],
      transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|jose))'],
      setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    },
    // E2E tests configuration
    {
      displayName: 'e2e',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: '<rootDir>',
      testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
      moduleFileExtensions: ['js', 'json', 'ts'],
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$|@nestjs/terminus|wrap-ansi|string-width|strip-ansi|ansi-regex|ansi-styles|boxen|jose))',
      ],
      moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    },
  ],
};

export default config;
