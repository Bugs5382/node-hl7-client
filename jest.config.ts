import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/__fixtures__/', '/__utils__/'],
  resolver: 'jest-ts-webcompat-resolver',
}

export default jestConfig
