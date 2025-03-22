# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
