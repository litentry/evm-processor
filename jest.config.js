module.exports = {
  clearMocks: true,
  setupFilesAfterEnv: ['./setup-jest.ts'],
  testRegex: [
    '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$'
  ],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testMatch: [
    "**/?(*.)+(spec|test).[t]s?(x)"
  ],
  collectCoverageFrom: [
    "**/src/**/*.[t]s?(x)",
    "!**/node_modules/**",
    "!**/vendor/**",
  ]
};
