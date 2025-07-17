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
      collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/main.ts'],
    },
    // E2E tests configuration
    {
      displayName: 'e2e',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testRegex: '.e2e-spec.ts$',
      rootDir: '<rootDir>/test',
      moduleFileExtensions: ['js', 'json', 'ts'],
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$|@nestjs/terminus|wrap-ansi|string-width|strip-ansi|ansi-regex|ansi-styles|boxen))',
      ],
    },
  ],
};

export default config;
