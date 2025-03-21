# Testing the cypress-dependent-tests Plugin

This document provides guidance on how to test the cypress-dependent-tests plugin.

## Table of Contents

1. [Testing Approaches](#testing-approaches)
2. [Setting Up the Test Environment](#setting-up-the-test-environment)
3. [Running the Tests](#running-the-tests)
4. [Example Test Cases](#example-test-cases)
5. [Interpreting Test Results](#interpreting-test-results)
6. [Troubleshooting](#troubleshooting)

## Testing Approaches

There are several approaches to testing the cypress-dependent-tests plugin:

### 1. Integration Testing (Existing Approach)

The plugin already includes integration tests in `cypress/integration/dependent-tests.spec.js`. These tests verify that the plugin works correctly within the Cypress environment. They test:

- Basic dependencies (parent test passes)
- Failed parent tests (dependent tests are skipped)
- Complex dependency relationships
- FailFast mode

### 2. Unit Testing

While not currently implemented, you could add unit tests for individual functions using a testing framework like Jest. This would involve:

- Testing the `shouldSkipTest` function with various dependency configurations
- Testing the `configure` function to ensure it correctly merges configurations
- Testing the `resetState` function to ensure it resets the state correctly

### 3. End-to-End Testing

You can create end-to-end tests that use the plugin in real-world scenarios:

- Create a simple web application with multiple pages
- Write Cypress tests that navigate through the application with dependencies between tests
- Verify that the plugin correctly skips dependent tests when parent tests fail

## Setting Up the Test Environment

### Prerequisites

- Node.js (>= 12.0.0)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cypress-dependent-tests.git
   cd cypress-dependent-tests
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

## Running the Tests

### Running Integration Tests

To run the existing integration tests:

```bash
npm test
```

This will run the Cypress tests in headless mode.

To run the tests in interactive mode:

```bash
npm run cypress:open
```

This will open the Cypress Test Runner, where you can select and run individual tests.

### Adding and Running Unit Tests

To add unit tests:

1. Install Jest:
   ```bash
   npm install --save-dev jest @types/jest ts-jest
   ```

2. Create a Jest configuration file (`jest.config.js`):
   ```javascript
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
   };
   ```

3. Add a test script to `package.json`:
   ```json
   {
     "scripts": {
       "test:unit": "jest"
     }
   }
   ```

4. Create a test file (`src/__tests__/index.test.ts`):
   ```typescript
   import { resetState, defineTestDependencies } from '../index';

   // Mock Cypress global functions
   global.it = jest.fn();
   global.cy = {
     wrap: jest.fn().mockReturnThis(),
     log: jest.fn(),
   };
   global.afterEach = jest.fn();

   describe('cypress-dependent-tests', () => {
     beforeEach(() => {
       resetState();
       jest.clearAllMocks();
     });

     test('defineTestDependencies sets dependencies correctly', () => {
       const dependencies = {
         'Test 1': ['Test 2', 'Test 3'],
       };
       defineTestDependencies(dependencies);
       // Add assertions here
     });

     // Add more tests
   });
   ```

5. Run the unit tests:
   ```bash
   npm run test:unit
   ```

## Example Test Cases

Here are some example test cases to consider:

### Basic Dependency Test

```javascript
import { dependentIt, defineTestDependencies } from 'cypress-dependent-tests';

describe('Login Flow', () => {
  defineTestDependencies({
    'User can visit login page': ['User can enter credentials', 'User can submit login form'],
    'User can submit login form': ['User is redirected to dashboard'],
  });

  dependentIt('User can visit login page', () => {
    cy.visit('/login');
    cy.get('h1').should('contain', 'Login');
  });

  dependentIt('User can enter credentials', () => {
    cy.get('#username').type('testuser');
    cy.get('#password').type('password');
  });

  dependentIt('User can submit login form', () => {
    cy.get('form').submit();
  });

  dependentIt('User is redirected to dashboard', () => {
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Dashboard');
  });
});
```

### Testing FailFast Mode

```javascript
import { dependentIt, defineTestDependencies, configure } from 'cypress-dependent-tests';

describe('Shopping Cart with FailFast', () => {
  beforeEach(() => {
    configure({ failFast: true });
  });

  defineTestDependencies({
    'User can add item to cart': ['User can view cart', 'User can checkout'],
  });

  dependentIt('User can add item to cart', () => {
    cy.visit('/products');
    cy.get('.product').first().click();
    cy.get('.add-to-cart').click();
    // Force a failure
    cy.get('.cart-count').should('have.text', '2'); // Expecting 2 but it's 1
  });

  dependentIt('User can view cart', () => {
    cy.visit('/cart');
    cy.get('.cart-items').should('be.visible');
  });

  dependentIt('User can checkout', () => {
    cy.get('.checkout-button').click();
    cy.url().should('include', '/checkout');
  });
});
```

## Interpreting Test Results

When running the tests, you'll see output in the Cypress Test Runner or in the console (if running in headless mode).

### Successful Tests

For successful tests, you'll see:

- All tests marked as passed (green checkmarks)
- No skipped tests

### Failed Tests

For failed tests, you'll see:

- Parent tests marked as failed (red X)
- Dependent tests marked as skipped (blue dash)
- Log messages explaining why tests were skipped

### Example Output

```
Cypress Dependent Tests Plugin
  Basic Dependencies
    ✓ Parent Test
    ✓ Dependent Test 1
    ✓ Dependent Test 2
    ✓ Independent Test
  Failed Parent Test
    ✗ Failing Parent Test
      Skipping test "Skipped Test 1" because its dependency "Failing Parent Test" failed
    - Skipped Test 1
      Skipping test "Skipped Test 2" because its dependency "Failing Parent Test" failed
    - Skipped Test 2
    ✓ Still Running Test
```

## Troubleshooting

### Common Issues

1. **Tests not being skipped properly**
   - Ensure that test names in `defineTestDependencies` exactly match the test names in `dependentIt`
   - Check that `resetState()` is called before each test suite

2. **Plugin not working in Cypress**
   - Ensure the plugin is properly built (`npm run build`)
   - Check that you're importing from the correct path

3. **TypeScript errors**
   - Ensure TypeScript is installed (`npm install typescript`)
   - Check that `tsconfig.json` is properly configured

### Debugging Tips

1. Add debug logs to your tests:
   ```javascript
   dependentIt('Test Name', () => {
     cy.log(`[DEBUG] Test state: ${JSON.stringify(testState)}`);
     // Test code
   });
   ```

2. Use Cypress's debug capabilities:
   ```javascript
   dependentIt('Test Name', () => {
     cy.get('.element').then($el => {
       debugger; // This will pause execution in the browser
       // Test code
     });
   });
   ```

3. Check the browser console for errors when running tests in interactive mode.
