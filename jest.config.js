module.exports = {
  clearMocks: true,
  setupFilesAfterEnv: ['./setup-jest.ts'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testMatch: [
    "**/?(*.)+(spec|test).[t]s?(x)"
  ]
};
