/// <reference types="cypress" />

import { cytest, resetState } from '../../src/index';

describe('Cypress Smart Tests Plugin - Conditional Execution', () => {
  beforeEach(() => {
    // Reset the plugin state before each test suite
    resetState();

    // Set some environment variables for testing
    Cypress.env('ENABLE_FEATURE_X', true);
    Cypress.env('ENABLE_FEATURE_Y', false);
  });

  context('Conditional Tests with runIf', () => {
    cytest('Test that always runs (no condition)', () => {
      cy.log('This test should always run');
      cy.wrap(true).should('be.true');
    });

    cytest('Test that runs when condition is true', 
      { runIf: () => Cypress.env('ENABLE_FEATURE_X') }, 
      () => {
        cy.log('This test should run because ENABLE_FEATURE_X is true');
        cy.wrap(true).should('be.true');
      }
    );

    cytest('Test that is skipped when condition is false', 
      { runIf: () => Cypress.env('ENABLE_FEATURE_Y') }, 
      () => {
        cy.log('This test should be skipped because ENABLE_FEATURE_Y is false');
        cy.wrap(false).should('be.true'); // This would fail if the test ran
      }
    );

    cytest('Test with dynamic condition', 
      { runIf: () => {
        // You can put any logic here
        const currentBrowser = Cypress.browser.name;
        const isChrome = currentBrowser === 'chrome';
        cy.log(`Current browser: ${currentBrowser}, isChrome: ${isChrome}`);
        return isChrome;
      }}, 
      () => {
        cy.log('This test only runs in Chrome');
        cy.wrap(true).should('be.true');
      }
    );
  });

  context('Conditional Tests with only', () => {
    // Note: In a real test, you would use only one of these tests with .only()
    // Here we're just testing that the syntax works with options

    // Uncomment to test .only() functionality with options
    // cytest.only('Only test with condition', 
    //   { runIf: () => Cypress.env('ENABLE_FEATURE_X') }, 
    //   () => {
    //     cy.log('This would be the only test that runs, and only if ENABLE_FEATURE_X is true');
    //     cy.wrap(true).should('be.true');
    //   }
    // );
  });

  context('Conditional Tests with skip', () => {
    // Test that skip works with options
    cytest.skip('Skipped test with condition', 
      { runIf: () => Cypress.env('ENABLE_FEATURE_X') }, 
      () => {
        cy.log('This test should be skipped regardless of the condition');
        cy.wrap(false).should('be.true'); // This would fail if the test ran
      }
    );
  });
});
