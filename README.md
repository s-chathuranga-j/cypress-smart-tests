# cypress-smart-tests

A Cypress plugin for smart test execution with dependencies, conditional tests, and hooks. It allows you to define dependencies between test cases, conditionally run tests based on environment variables or other factors, and add custom setup/cleanup hooks to individual tests.

## Features

- Define dependencies between test cases
- Automatically skip dependent tests if the parent test fails with fail-fast option
- Selectively execute tests based on environment variables, feature flags, or other conditions
- Add custom before/after hooks to individual tests for setup and cleanup
- Clear console output showing what was skipped and why
- Easy-to-use API with minimal intrusion

## Installation

```bash
npm install --save-dev cypress-smart-tests
```

## Usage

### Basic Usage

```javascript
import { cytest, defineTestDependencies } from 'cypress-smart-tests';

// Define dependencies between tests
defineTestDependencies({
  'Test 1': ['Test 2', 'Test 3'], // if Test 1 fails, skip Test 2 & 3
});

describe('Dependent Test Suite', () => {
  cytest('Test 1', () => {
    cy.visit('https://example.com');
    cy.get('h1').should('contain', 'Example Domain');
  });

  cytest('Test 2', () => {
    cy.log('This will be skipped if Test 1 fails');
  });

  cytest('Test 3', () => {
    cy.log('Also skipped if Test 1 fails');
  });

  cytest('Independent Test', () => {
    cy.log('This will run regardless');
  });
});
```

### Configuration

You can configure the plugin with the `configure` function:

```javascript
import { configure } from 'cypress-smart-tests';

// Configure the plugin
configure({
  failFast: true, // Stop execution after any parent failure
});
```

## API

### `cytest(name, options, fn)` or `cytest(name, fn)`

A wrapper around Cypress's `it()` function that respects test dependencies and supports conditional execution.

- `name` (string): The name of the test
- `options` (object) [optional]: Options for the test
  - `runIf` (function): A function that returns a boolean indicating whether the test should run
  - `before` (function): A function to run before the test (useful for setup)
  - `after` (function): A function to run after the test (useful for cleanup)
- `fn` (function): The test function

### `defineTestDependencies(dependencies)`

Define dependencies between tests.

- `dependencies` (object): An object mapping parent tests to their dependent tests

### `configure(config)`

Configure the plugin.

- `config` (object): Configuration options
  - `failFast` (boolean): If true, stop execution after any parent failure

### `resetState()`

Reset the plugin state

## Examples

### Complex Dependencies

```javascript
import { cytest, defineTestDependencies } from 'cypress-smart-tests';

// Define complex dependencies
defineTestDependencies({
  'Login': ['View Profile', 'Edit Profile', 'Logout'],
  'View Profile': ['Edit Profile'],
});

describe('User Management', () => {
  cytest('Login', () => {
    // Login test
  });

  cytest('View Profile', () => {
    // View profile test
  });

  cytest('Edit Profile', () => {
    // Edit profile test
  });

  cytest('Logout', () => {
    // Logout test
  });
});
```

### Conditional Execution

You can use the `runIf` option to conditionally run tests based on environment variables, feature flags, or other conditions:

```javascript
import { cytest } from 'cypress-smart-tests';

describe('Feature Tests', () => {
  // Set environment variables in cypress.config.js or via command line
  // e.g., cypress run --env ENABLE_FEATURE_X=true

  // Test that only runs when ENABLE_FEATURE_X is true
  cytest('Feature X Test', 
    { runIf: () => Cypress.env('ENABLE_FEATURE_X') }, 
    () => {
      cy.log('Testing Feature X');
      // Test code here
    }
  );

  // Test with dynamic condition based on browser
  cytest('Chrome-only Test', 
    { runIf: () => Cypress.browser.name === 'chrome' }, 
    () => {
      cy.log('This test only runs in Chrome');
      // Test code here
    }
  );

  // You can use any logic in the runIf function
  cytest('Mobile viewport Test', 
    { runIf: () => {
      const viewportWidth = Cypress.config('viewportWidth');
      return viewportWidth < 768; // Only run on mobile viewports
    }}, 
    () => {
      cy.log('Testing mobile layout');
      // Test code here
    }
  );
});
```

### Using Test Hooks

You can use the `before` and `after` hooks to run setup and cleanup code for individual tests:

```javascript
import { cytest } from 'cypress-smart-tests';

describe('Tests with Hooks', () => {
  // Test with setup and cleanup
  cytest('Test with cleanup', {
    before: () => {
      cy.log('Setting up test environment');
      // Create test data or set up environment
      cy.exec('echo "Setup complete" > setup.txt');
    },
    after: () => {
      cy.log('Cleaning up test environment');
      // Clean up test data or environment
      cy.exec('rm setup.txt');
    }
  }, () => {
    // Test logic
    cy.exec('cat setup.txt').its('stdout').should('contain', 'Setup complete');
  });

  // Combine hooks with conditional execution
  cytest('Test with hooks and conditions', {
    runIf: () => Cypress.env('RUN_CLEANUP_TESTS') === true,
    before: () => cy.log('Running setup for conditional test'),
    after: () => cy.log('Running cleanup for conditional test')
  }, () => {
    // Test logic that only runs when the condition is met
    cy.log('Test with both hooks and conditions');
  });
});
```

### Using with TypeScript

The plugin is written in TypeScript and includes type definitions.

```typescript
import { cytest, defineTestDependencies, configure } from 'cypress-smart-tests';

// Type-safe configuration
configure({
  failFast: true,
});

// Type-safe dependencies
defineTestDependencies({
  'Test 1': ['Test 2', 'Test 3'],
});
```

## License

MIT

## Contributing and Publishing

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Publishing

To publish this package to npm:

1. Update the repository URL in package.json to your actual repository.
2. Update the author field in package.json with your name and email.
3. Make sure the package name is set to 'cypress-smart-tests'.
4. Build the package: `npm run build`
5. Test the package: `npm test`
6. Login to npm: `npm login`
7. Publish the package: `npm publish`
