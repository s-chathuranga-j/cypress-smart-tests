/// <reference types="cypress" />

import { cytest, resetState } from '../../src/index';

describe('Cypress Smart Tests Plugin - Hooks', () => {
  beforeEach(() => {
    // Reset the plugin state before each test suite
    resetState();

    // Create a custom command to track hook execution
    cy.wrap({ beforeHookExecuted: false, afterHookExecuted: false }, { log: false })
      .as('hookState');
  });

  context('Basic Hooks', () => {
    cytest('Test with before and after hooks', {
      before: () => {
        cy.log('Executing before hook');
        cy.wrap(true).as('beforeHookExecuted');
      },
      after: () => {
        cy.log('Executing after hook');
        cy.wrap(true).as('afterHookExecuted');
      }
    }, () => {
      cy.log('Executing test body');
      cy.get('@beforeHookExecuted').should('eq', true);
    });

    // Add a simple test to verify the hooks work
    cytest('Simple test with hooks', {
      before: () => {
        cy.log('This before hook should execute');
      },
      after: () => {
        cy.log('This after hook should execute');
      }
    }, () => {
      cy.log('This test should run after the before hook and before the after hook');
      expect(true).to.be.true;
    });
  });

  context('Hooks with Async Operations', () => {
    cytest('Test with async hooks', {
      before: () => {
        cy.log('Executing async before hook');
        return cy.wait(100).then(() => {
          cy.wrap(true).as('asyncBeforeHookExecuted');
        });
      },
      after: () => {
        cy.log('Executing async after hook');
        return cy.wait(100).then(() => {
          cy.wrap(true).as('asyncAfterHookExecuted');
        });
      }
    }, () => {
      cy.log('Executing test body');
      cy.get('@asyncBeforeHookExecuted').should('eq', true);
    });

    // Add a simple test with async hooks
    cytest('Simple test with async hooks', {
      before: () => {
        cy.log('This async before hook should execute');
        return cy.wait(50);
      },
      after: () => {
        cy.log('This async after hook should execute');
        return cy.wait(50);
      }
    }, () => {
      cy.log('This test should run after the async before hook and before the async after hook');
      expect(true).to.be.true;
    });
  });

  context('Hooks with Conditional Execution', () => {
    cytest('Test with hooks and runIf (true)', {
      runIf: () => true,
      before: () => {
        cy.log('Executing before hook (runIf true)');
        cy.get('@hookState').then(state => {
          state.beforeHookExecuted = true;
          cy.wrap(state).as('hookState');
        });
      },
      after: () => {
        cy.log('Executing after hook (runIf true)');
        cy.get('@hookState').then(state => {
          state.afterHookExecuted = true;
          cy.wrap(state).as('hookState');
        });
      }
    }, () => {
      cy.log('Executing test body (runIf true)');
      cy.get('@hookState').then(state => {
        expect(state.beforeHookExecuted).to.be.true;
        expect(state.afterHookExecuted).to.be.false;
      });
    });

    cytest('Test with hooks and runIf (false)', {
      runIf: () => false,
      before: () => {
        cy.log('Executing before hook (runIf false)');
        cy.get('@hookState').then(state => {
          state.beforeHookExecuted = true;
          cy.wrap(state).as('hookState');
        });
      },
      after: () => {
        cy.log('Executing after hook (runIf false)');
        cy.get('@hookState').then(state => {
          state.afterHookExecuted = true;
          cy.wrap(state).as('hookState');
        });
      }
    }, () => {
      cy.log('Executing test body (runIf false)');
      // This should not execute
      expect(true).to.be.false;
    });

    cytest('Verify hooks with runIf (false) were not executed', () => {
      cy.get('@hookState').then(state => {
        // The hooks should not have executed because runIf returned false
        expect(state.beforeHookExecuted).to.be.false;
        expect(state.afterHookExecuted).to.be.false;
      });
    });
  });

  context('Practical Examples', () => {
    cytest('Test with setup and cleanup', {
      before: () => {
        cy.log('Setting up test environment');
        // In a real test, this might create test data or set up the environment
        cy.wrap({ testData: 'example' }).as('testSetup');
      },
      after: () => {
        cy.log('Cleaning up test environment');
        // In a real test, this might delete test data or clean up the environment
        cy.get('@testSetup').then(setup => {
          cy.log(`Cleaning up test data: ${setup.testData}`);
        });
      }
    }, () => {
      cy.log('Executing test with setup and cleanup');
      cy.get('@testSetup').then(setup => {
        expect(setup.testData).to.equal('example');
      });
    });
  });
});
