module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^../../apiClient$': '<rootDir>/src/apiClient.ts',
    '^../(VotesListView|SeriesListView|CandidateListView)$': '<rootDir>/src/views/$1.tsx',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};
