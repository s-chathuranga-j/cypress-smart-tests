# cypress-dependent-tests

A Cypress plugin that allows you to define dependencies between test cases. If a parent test fails, its dependent tests will be automatically skipped.

## Features

- Define dependencies between test cases
- Automatically skip dependent tests if the parent test fails
- Clear console output showing what was skipped and why
- Optional failFast mode to stop after any parent failure
- Easy-to-use API with minimal intrusion

## Installation

```bash
npm install --save-dev cypress-dependent-tests
```

## Usage

### Basic Usage

```javascript
import { dependentIt, defineTestDependencies } from 'cypress-dependent-tests';

// Define dependencies between tests
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

### Configuration

You can configure the plugin with the `configure` function:

```javascript
import { configure } from 'cypress-dependent-tests';

// Configure the plugin
configure({
  failFast: true, // Stop execution after any parent failure
});
```

## API

### `dependentIt(name, fn)`

A wrapper around Cypress's `it()` function that respects test dependencies.

- `name` (string): The name of the test
- `fn` (function): The test function

### `defineTestDependencies(dependencies)`

Define dependencies between tests.

- `dependencies` (object): An object mapping parent tests to their dependent tests

### `configure(config)`

Configure the plugin.

- `config` (object): Configuration options
  - `failFast` (boolean): If true, stop execution after any parent failure

### `resetState()`

Reset the plugin state (useful for testing).

## Examples

### Complex Dependencies

```javascript
import { dependentIt, defineTestDependencies } from 'cypress-dependent-tests';

// Define complex dependencies
defineTestDependencies({
  'Login': ['View Profile', 'Edit Profile', 'Logout'],
  'View Profile': ['Edit Profile'],
});

describe('User Management', () => {
  dependentIt('Login', () => {
    // Login test
  });

  dependentIt('View Profile', () => {
    // View profile test
  });

  dependentIt('Edit Profile', () => {
    // Edit profile test
  });

  dependentIt('Logout', () => {
    // Logout test
  });
});
```

### Using with TypeScript

The plugin is written in TypeScript and includes type definitions.

```typescript
import { dependentIt, defineTestDependencies, configure } from 'cypress-dependent-tests';

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