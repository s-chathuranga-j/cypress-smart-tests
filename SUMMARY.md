# cypress-dependent-tests Implementation Summary

## Project Overview

We've implemented a Cypress plugin that allows users to define dependencies between test cases. If a parent test fails, its dependent tests will be automatically skipped.

## Features Implemented

1. **Dependency Mapping**: Users can define dependencies between test cases using `defineTestDependencies()`.
2. **Automatic Skipping**: Dependent tests are automatically skipped if their parent tests fail.
3. **Clear Console Output**: The plugin provides clear logging about which tests were skipped and why.
4. **FailFast Mode**: An optional configuration to stop execution after any parent failure.
5. **Easy-to-use API**: The plugin provides a simple API with minimal intrusion into existing tests.

## Project Structure

```
cypress-dependent-tests/
├── .gitignore              # Git ignore file
├── LICENSE                 # MIT license
├── README.md               # Documentation and examples
├── SUMMARY.md              # This summary file
├── cypress.json            # Cypress configuration
├── cypress/                # Cypress test files
│   ├── integration/        # Test specs
│   │   └── dependent-tests.spec.js  # Test suite for the plugin
│   ├── plugins/            # Cypress plugins
│   │   └── index.js        # Plugin configuration
│   └── support/            # Support files
│       └── index.js        # Support configuration
├── package.json            # NPM package configuration
├── src/                    # Source code
│   └── index.ts            # Main implementation
└── tsconfig.json           # TypeScript configuration
```

## Implementation Details

### Core Functionality

1. **Global State**: We track the pass/fail status of tests in a shared context.
2. **Wrapper for it**: We provide a `dependentIt()` function that wraps Cypress's `it()` and checks dependencies.
3. **Dependency Graph**: We create a simple dependency tree using the provided mapping.
4. **Test Result Tracking**: We hook into Cypress's test lifecycle to track test outcomes.
5. **Console Reporting**: We log skipped tests with reasons in the console.

### API

- `dependentIt(name, fn)`: A wrapper around Cypress's `it()` function that respects test dependencies.
- `defineTestDependencies(dependencies)`: Define dependencies between tests.
- `configure(config)`: Configure the plugin options.
- `resetState()`: Reset the plugin state (useful for testing).

## Usage Example

```javascript
import { dependentIt, defineTestDependencies } from 'cypress-dependent-tests';

defineTestDependencies({
  'Test 1': ['Test 2', 'Test 3'], // if Test 1 fails, skip Test 2 & 3
});

describe('Dependent Test Suite', () => {
  dependentIt('Test 1', () => {
    cy.visit('https://example.com');
    cy.get('h1').should('contain', 'Example Domain');
  });

  dependentIt('Test 2', () => {
    cy.log('This will be skipped if Test 1 fails');
  });

  dependentIt('Test 3', () => {
    cy.log('Also skipped if Test 1 fails');
  });

  dependentIt('Independent Test', () => {
    cy.log('This will run regardless');
  });
});
```

## Publishing Instructions

To publish this package to npm:

1. Update the repository URL in package.json to your actual repository.
2. Build the package: `npm run build`
3. Test the package: `npm test`
4. Login to npm: `npm login`
5. Publish the package: `npm publish`

## Next Steps

- Add more examples and documentation
- Add more test cases to cover edge cases
- Consider adding a visual indicator in the Cypress test runner for skipped tests
- Add support for more complex dependency relationships (e.g., OR dependencies)