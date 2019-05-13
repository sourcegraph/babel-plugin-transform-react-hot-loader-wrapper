// @ts-check

const path = require('path')

/** @type {jest.InitialOptions} */
const config = {
  collectCoverage: !!process.env.CI,
  coverageDirectory: '<rootDir>/coverage',
  coveragePathIgnorePatterns: [/\.test\.tsx?$/.source],
  roots: ['<rootDir>/src'],

  // By default, don't clutter `yarn test --watch` output with the full coverage table. To see it, use the
  // `--coverageReporters text` jest option.
  coverageReporters: ['json', 'lcov', 'text-summary'],
}

module.exports = config
