# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2026-04-22

### Changed
- Added Cypress `15.14.1` compatibility for the plugin and project test harness
- Migrated plugin internals away from legacy browser-side `Cypress.env()` usage so the project can run with `allowCypressEnv: false`
- Updated examples and integration coverage to use Cypress 15-compatible environment access patterns
- Refreshed publish metadata and release assets for npm publication

## [2.1.0] - 2025-04-01

### Added
- Added support for cypress-grep plugin tags in `cytest()`, `cytest.only()`, and `cytest.skip()` functions
- New `tags` option for filtering tests when using cypress-grep plugin
- Added documentation and examples for using tags with cypress-smart-tests

## [2.0.0] - 2025-03-25

### Added
- Added persistent variables functionality with `cyVariable()` and `cyVariables()` functions
- `cyVariable(name, value?)` for getting and setting individual variables that persist across tests
- `cyVariables()` for managing multiple variables with methods like `add()`, `get()`, `has()`, `remove()`, `getAll()`, and `clear()`
- Enhanced `resetState()` function with optional parameter to reset variables
- Added comprehensive tests for the new variables functionality

### Changed
- Major version upgrade due to new feature addition

## [1.0.2] - 2025-03-22

### Added
- Added JSDoc examples for all public API methods to improve developer experience with better intellisense documentation

## [1.0.1] - 2025-03-22

### Changed
- Set fail-fast to true by default when dependent tests are defined. This ensures that dependent tests are automatically skipped when their parent test fails, without the need to explicitly set `failFast` to `true`.

## [1.0.0] - 2025-03-22

### Added
- Initial release of cypress-smart-tests
- Define dependencies between test cases
- Automatically skip dependent tests if the parent test fails with fail-fast option
- Selectively execute tests based on environment variables, feature flags, or other conditions
- Add custom before/after hooks to individual tests for setup and cleanup
- Clear console output showing what was skipped and why
- Easy-to-use API with minimal intrusion
