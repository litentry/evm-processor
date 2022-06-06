module.exports = {
  clearMocks: true,
  setupFilesAfterEnv: ['./setup-jest.ts'],
  testRegex: [
    '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$'
  ],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
};
