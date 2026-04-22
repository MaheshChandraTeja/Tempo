import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|react-clone-referenced-element|expo(nent)?|@expo(nent)?/.*|expo-.*|@expo/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-navigation|@react-navigation/.*))',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  clearMocks: true,
  collectCoverageFrom: [
    'vision/**/*.ts',
    'features/**/*.ts',
    'modules/**/*.ts',
    'storage/**/*.ts',
    '!**/*.d.ts',
  ],
};

export default config;