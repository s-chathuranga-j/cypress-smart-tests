# cypress-smart-tests

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A powerful Cypress plugin that enhances your test suite with smart execution capabilities:
- **Dependent Tests**: Define dependencies between test cases and automatically skip dependent tests when parent tests fail
- **Conditional Tests**: Run tests only when specific conditions are met (environment variables, feature flags, browser type, etc.)
- **Test-specific Hooks**: Add custom setup and cleanup code to individual tests
- **Persistent Variables**: Share variables across tests without resetting between test runs

## Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Features](#-features)
  - [Test Dependencies](#test-dependencies)
  - [Conditional Test Execution](#conditional-test-execution)
  - [Test-specific Hooks](#test-specific-hooks)
  - [Persistent Variables](#persistent-variables)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [TypeScript Support](#-typescript-support)
- [Contributing](#-contributing)
- [License](#-license)

## Installation

```bash
npm install --save-dev cypress-smart-tests
```

## Quick Start

```javascript
import { cytest, defineTestDependencies, configure } from 'cypress-smart-tests';

// Define dependencies between tests
defineTestDependencies({
  'Login Test': ['View Profile Test', 'Edit Profile Test'],
});

describe('User Management', () => {
  // Use cytest instead of it
  cytest('Login Test', () => {
    cy.visit('/login');
    cy.get('#username').type('testuser');
    cy.get('#password').type('password');
    cy.get('#login-button').click();
    cy.url().should('include', '/dashboard');
  });

  // This test will be skipped if 'Login Test' fails
  cytest('View Profile Test', () => {
    cy.get('#profile-link').click();
    cy.url().should('include', '/profile');
  });

  // This test will be skipped if 'Login Test' fails
  cytest('Edit Profile Test', () => {
    cy.get('#profile-link').click();
    cy.get('#edit-button').click();
    cy.get('#name').clear().type('New Name');
    cy.get('#save-button').click();
    cy.get('.success-message').should('be.visible');
  });

  // This test will run regardless of other test results
  cytest('Independent Test', () => {
    cy.visit('/about');
    cy.get('h1').should('contain', 'About Us');
  });
});
```

## Features

### Test Dependencies

Define dependencies between tests and automatically skip dependent tests when parent tests fail.

```javascript
import { cytest, defineTestDependencies } from 'cypress-smart-tests';

// Define dependencies
defineTestDependencies({
  'Parent Test': ['Child Test 1', 'Child Test 2'],
  'Child Test 1': ['Grandchild Test'],
});

describe('Dependent Tests', () => {
  cytest('Parent Test', () => {
    // If this test fails, 'Child Test 1', 'Child Test 2', and 'Grandchild Test' will be skipped
    cy.wrap(true).should('be.true');
  });

  cytest('Child Test 1', () => {
    // If this test fails, 'Grandchild Test' will be skipped
    cy.wrap(true).should('be.true');
  });

  cytest('Child Test 2', () => {
    cy.wrap(true).should('be.true');
  });

  cytest('Grandchild Test', () => {
    cy.wrap(true).should('be.true');
  });

  cytest('Independent Test', () => {
    // This test will run regardless of other test results
    cy.wrap(true).should('be.true');
  });
});
```

### Conditional Test Execution

Run tests only when specific conditions are met.

```javascript
import { cytest } from 'cypress-smart-tests';

describe('Conditional Tests', () => {
  // Test that runs only when a feature flag is enabled
  cytest('Feature X Test', 
    { runIf: () => Cypress.env('ENABLE_FEATURE_X') === true }, 
    () => {
      cy.log('Testing Feature X');
      cy.visit('/feature-x');
      cy.get('.feature-x-element').should('be.visible');
    }
  );

  // Test that runs only in Chrome
  cytest('Chrome-only Test', 
    { runIf: () => Cypress.browser.name === 'chrome' }, 
    () => {
      cy.log('This test only runs in Chrome');
      cy.visit('/browser-specific');
      cy.get('.chrome-element').should('be.visible');
    }
  );

  // Test that runs only on mobile viewports
  cytest('Mobile Layout Test', 
    { runIf: () => {
      const viewportWidth = Cypress.config('viewportWidth');
      return viewportWidth < 768; // Only run on mobile viewports
    }}, 
    () => {
      cy.log('Testing mobile layout');
      cy.visit('/responsive');
      cy.get('.mobile-menu').should('be.visible');
    }
  );
});
```

### Test-specific Hooks

Add custom setup and cleanup code to individual tests.

```javascript
import { cytest } from 'cypress-smart-tests';

describe('Tests with Hooks', () => {
  // Test with setup and cleanup
  cytest('User Profile Test', {
    before: () => {
      cy.log('Setting up test data');
      // Create a test user
      cy.request('POST', '/api/users', {
        name: 'Test User',
        email: 'test@example.com'
      }).then(response => {
        cy.wrap(response.body).as('testUser');
      });
    },
    after: () => {
      cy.log('Cleaning up test data');
      // Delete the test user
      cy.get('@testUser').then(user => {
        cy.request('DELETE', `/api/users/${user.id}`);
      });
    }
  }, () => {
    // Test logic
    cy.get('@testUser').then(user => {
      cy.visit(`/users/${user.id}`);
      cy.get('.user-name').should('contain', user.name);
    });
  });

  // Combine hooks with conditional execution
  cytest('Admin Feature Test', {
    runIf: () => Cypress.env('TEST_ADMIN_FEATURES') === true,
    before: () => {
      cy.log('Setting up admin user');
      cy.request('POST', '/api/login', {
        username: 'admin',
        password: Cypress.env('ADMIN_PASSWORD')
      });
    },
    after: () => {
      cy.log('Logging out admin user');
      cy.request('POST', '/api/logout');
    }
  }, () => {
    cy.visit('/admin/dashboard');
    cy.get('.admin-panel').should('be.visible');
  });
});
```

### Persistent Variables

Share variables across tests without resetting between test runs.

```javascript
import { cytest, cyVariable, cyVariables } from 'cypress-smart-tests';

describe('User Management with Persistent Variables', () => {
  // Set up variables before tests
  before(() => {
    // Simple variable
    cyVariable('username', 'testuser');

    // Complex variable
    cyVariables().add('userCredentials', {
      username: 'admin',
      password: 'password123'
    });
  });

  cytest('Login Test', () => {
    // Get variables set in the before hook
    const username = cyVariable('username');
    const credentials = cyVariables().get('userCredentials');

    cy.visit('/login');
    cy.get('#username').type(credentials.username);
    cy.get('#password').type(credentials.password);
    cy.get('#login-button').click();

    // Store the user ID for use in later tests
    cy.url().should('include', '/dashboard');
    cy.get('[data-user-id]').invoke('attr', 'data-user-id').then(userId => {
      cyVariable('userId', userId);
    });
  });

  cytest('Profile Test', () => {
    // Variables persist across tests
    const userId = cyVariable('userId');

    // This test will use the userId from the previous test
    cy.visit(`/users/${userId}/profile`);
    cy.get('.profile-name').should('be.visible');

    // Update a variable
    cyVariable('lastVisitedPage', 'profile');
  });

  cytest('Logout Test', () => {
    // Get the last visited page
    const lastPage = cyVariable('lastVisitedPage');
    cy.log(`Last visited page: ${lastPage}`);

    // Clear specific variables when done
    cyVariables().remove('userId');

    // Or clear all variables
    // cyVariables().clear();
  });
});
```

## 📚 API Reference

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
  - `failFast` (boolean): If true, skip dependent tests when parent tests fail

### `resetState(resetVariables?)`

Reset the plugin state. Useful in `beforeEach` hooks to ensure a clean state for each test suite.

- `resetVariables` (boolean) [optional]: If true, also reset the persistent variables

### `cyVariable(name, value?)`

Get or set a persistent variable that doesn't reset across tests.

- `name` (string): The name of the variable
- `value` (any) [optional]: The value to set (if provided)
- Returns: The current value of the variable

### `cyVariables()`

Manage multiple persistent variables that don't reset across tests.

- Returns: An object with the following methods:
  - `add(name, value)`: Add or update a variable
  - `get(name)`: Get a variable
  - `has(name)`: Check if a variable exists
  - `remove(name)`: Remove a variable
  - `getAll()`: Get all variables
  - `clear()`: Clear all variables

## 🧪 Examples

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
    // Login test logic
    cy.visit('/login');
    cy.get('#username').type('testuser');
    cy.get('#password').type('password');
    cy.get('#login-button').click();
    cy.url().should('include', '/dashboard');
  });

  cytest('View Profile', () => {
    // View profile test logic
    cy.get('#profile-link').click();
    cy.url().should('include', '/profile');
  });

  cytest('Edit Profile', () => {
    // Edit profile test logic
    cy.get('#profile-link').click();
    cy.get('#edit-button').click();
    cy.get('#name').clear().type('New Name');
    cy.get('#save-button').click();
    cy.get('.success-message').should('be.visible');
  });

  cytest('Logout', () => {
    // Logout test logic
    cy.get('#logout-button').click();
    cy.url().should('include', '/login');
  });
});
```

### Advanced Conditional Tests

```javascript
import { cytest } from 'cypress-smart-tests';

describe('Advanced Conditional Tests', () => {
  // Test that runs based on multiple conditions
  cytest('Premium Feature Test', 
    { runIf: () => {
      // Only run this test if:
      // 1. We're testing premium features
      // 2. We're in a specific environment
      // 3. We're using a specific browser
      return Cypress.env('TEST_PREMIUM_FEATURES') === true &&
             Cypress.env('ENVIRONMENT') === 'staging' &&
             Cypress.browser.name === 'chrome';
    }}, 
    () => {
      cy.log('Testing premium features in staging on Chrome');
      cy.visit('/premium-features');
      cy.get('.premium-content').should('be.visible');
    }
  );

  // Test with dynamic data-driven condition
  cytest('Data-driven Conditional Test', 
    { runIf: () => {
      // Fetch some data and decide whether to run the test
      return cy.request('/api/feature-config')
        .then(response => {
          return response.body.enableNewFeature === true;
        });
    }}, 
    () => {
      cy.log('Testing new feature that is enabled in the config');
      cy.visit('/new-feature');
      cy.get('.new-feature-element').should('be.visible');
    }
  );
});
```

### Advanced Persistent Variables

```javascript
import { cytest, cyVariable, cyVariables, resetState } from 'cypress-smart-tests';

describe('E-commerce Checkout Flow with Persistent Variables', () => {
  before(() => {
    // Reset variables at the start of the suite
    resetState(true);

    // Set up initial test data
    cyVariables().add('testProducts', [
      { id: 'p1', name: 'Product 1', price: 10.99 },
      { id: 'p2', name: 'Product 2', price: 24.99 },
      { id: 'p3', name: 'Product 3', price: 5.99 }
    ]);

    cyVariables().add('cart', []);
    cyVariables().add('user', null);
  });

  cytest('User Registration', () => {
    cy.visit('/register');

    // Generate a unique email
    const email = `test-${Date.now()}@example.com`;
    const user = {
      email: email,
      name: 'Test User',
      address: '123 Test St'
    };

    // Fill registration form
    cy.get('#name').type(user.name);
    cy.get('#email').type(user.email);
    cy.get('#address').type(user.address);
    cy.get('#password').type('password123');
    cy.get('#register-button').click();

    // Store user data for later tests
    cy.url().should('include', '/account');
    cy.get('[data-user-id]').invoke('attr', 'data-user-id').then(userId => {
      user.id = userId;
      cyVariables().add('user', user);
    });
  });

  cytest('Add Products to Cart', () => {
    // Get user and products from previous test
    const user = cyVariables().get('user');
    const products = cyVariables().get('testProducts');

    cy.log(`Shopping as user: ${user.name}`);
    cy.visit('/products');

    // Add first two products to cart
    const cart = [];
    cy.get(`[data-product-id="${products[0].id}"]`).find('.add-to-cart').click();
    cart.push(products[0]);

    cy.get(`[data-product-id="${products[1].id}"]`).find('.add-to-cart').click();
    cart.push(products[1]);

    // Store cart for later tests
    cyVariables().add('cart', cart);

    // Verify cart count
    cy.get('.cart-count').should('contain', '2');
  });

  cytest('Checkout Process', () => {
    // Get user and cart from previous tests
    const user = cyVariables().get('user');
    const cart = cyVariables().get('cart');

    // Calculate total price
    const totalPrice = cart.reduce((sum, product) => sum + product.price, 0);

    cy.log(`Checking out with ${cart.length} items for $${totalPrice.toFixed(2)}`);
    cy.visit('/cart');

    // Verify cart contents
    cy.get('.cart-items .item').should('have.length', cart.length);

    // Proceed to checkout
    cy.get('#checkout-button').click();

    // Verify user info is pre-filled
    cy.get('#checkout-name').should('have.value', user.name);
    cy.get('#checkout-email').should('have.value', user.email);
    cy.get('#checkout-address').should('have.value', user.address);

    // Complete order
    cy.get('#place-order-button').click();

    // Store order info
    cy.get('.order-confirmation').invoke('attr', 'data-order-id').then(orderId => {
      cyVariable('lastOrderId', orderId);
    });

    // Clear cart after successful order
    cyVariables().add('cart', []);
  });

  cytest('Order Confirmation', () => {
    // Get order ID from previous test
    const orderId = cyVariable('lastOrderId');
    const user = cyVariables().get('user');

    cy.log(`Checking order confirmation for order: ${orderId}`);
    cy.visit(`/orders/${orderId}`);

    // Verify order details
    cy.get('.order-id').should('contain', orderId);
    cy.get('.order-customer').should('contain', user.name);

    // Store order history
    const orderHistory = cyVariables().has('orderHistory') 
      ? cyVariables().get('orderHistory') 
      : [];

    orderHistory.push(orderId);
    cyVariables().add('orderHistory', orderHistory);

    cy.log(`User now has ${orderHistory.length} orders in history`);
  });
});
```

### Combining All Features

```javascript
import { cytest, cyVariable, cyVariables, defineTestDependencies, configure } from 'cypress-smart-tests';

// Configure the plugin
configure({
  failFast: true,
});

// Define dependencies
defineTestDependencies({
  'Setup': ['Feature A Test', 'Feature B Test'],
});

describe('Combined Features', () => {
  before(() => {
    // Initialize persistent variables
    cyVariable('setupComplete', false);
  });

  cytest('Setup', {
    before: () => {
      cy.log('Global setup for all dependent tests');
      cy.request('POST', '/api/reset-test-data');
    },
    after: () => {
      cy.log('Global cleanup after all dependent tests');
      cy.request('POST', '/api/cleanup');

      // Mark setup as complete for other tests
      cyVariable('setupComplete', true);
    }
  }, () => {
    cy.visit('/');
    cy.get('.welcome-message').should('be.visible');
  });

  cytest('Feature A Test', {
    runIf: () => Cypress.env('ENABLE_FEATURE_A') === true,
    before: () => {
      cy.log('Setting up Feature A test');
      cy.request('POST', '/api/features/a/enable');

      // Store feature-specific data
      cyVariables().add('featureAData', { enabled: true, timestamp: Date.now() });
    },
    after: () => {
      cy.log('Cleaning up Feature A test');
      cy.request('POST', '/api/features/a/disable');
    }
  }, () => {
    cy.visit('/feature-a');
    cy.get('.feature-a-element').should('be.visible');

    // Store test result
    cyVariable('featureATested', true);
  });

  cytest('Feature B Test', {
    runIf: () => Cypress.env('ENABLE_FEATURE_B') === true,
    before: () => {
      // Check if setup is complete
      const setupComplete = cyVariable('setupComplete');
      cy.log(`Setup complete: ${setupComplete}`);

      cy.log('Setting up Feature B test');
      cy.request('POST', '/api/features/b/enable');
    },
    after: () => {
      cy.log('Cleaning up Feature B test');
      cy.request('POST', '/api/features/b/disable');
    }
  }, () => {
    // Check if Feature A was tested
    const featureATested = cyVariable('featureATested');
    cy.log(`Feature A was tested: ${featureATested}`);

    cy.visit('/feature-b');
    cy.get('.feature-b-element').should('be.visible');
  });
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
