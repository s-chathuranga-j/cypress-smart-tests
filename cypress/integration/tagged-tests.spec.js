/// <reference types="cypress" />

import { cytest, resetState } from '../../src/index';

describe('Cypress Smart Tests Plugin - Tagged Tests', () => {
  beforeEach(() => {
    // Reset the plugin state before each test suite
    resetState();
  });

  context('Tests with Single Tag', () => {
    cytest('Test with user tag', 
      { tags: '@user' },
      () => {
        cy.log('This test has a single "user" tag');
        cy.wrap(true).should('be.true');
      }
    );

    cytest('Test with admin tag', 
      { tags: '@admin' },
      () => {
        cy.log('This test has a single "admin" tag');
        cy.wrap(true).should('be.true');
      }
    );
  });

  context('Tests with Multiple Tags', () => {
    cytest('Test with multiple tags', 
      { tags: ['@user', 'profile'] },
      () => {
        cy.log('This test has both "user" and "profile" tags');
        cy.wrap(true).should('be.true');
      }
    );

    cytest('Test with different multiple tags', 
      { tags: ['@admin', '@dashboard'] },
      () => {
        cy.log('This test has both "admin" and "dashboard" tags');
        cy.wrap(true).should('be.true');
      }
    );
  });

  context('Tests with Tags and Conditions', () => {
    // Set up environment variables for testing
    beforeEach(() => {
      Cypress.env('ENABLE_FEATURE_X', true);
      Cypress.env('ENABLE_FEATURE_Y', false);
    });

    cytest('Test with tag and true condition', 
      { 
        tags: 'feature-x',
        runIf: () => Cypress.env('ENABLE_FEATURE_X')
      }, 
      () => {
        cy.log('This test has a "feature-x" tag and should run because ENABLE_FEATURE_X is true');
        cy.wrap(true).should('be.true');
      }
    );

    cytest('Test with tags and false condition', 
      { 
        tags: ['feature-y', 'experimental'],
        runIf: () => Cypress.env('ENABLE_FEATURE_Y')
      }, 
      () => {
        cy.log('This test has "feature-y" and "experimental" tags but should be skipped because ENABLE_FEATURE_Y is false');
        cy.wrap(false).should('be.true'); // This would fail if the test ran
      }
    );
  });

  context('Tests with Tags and Hooks', () => {
    let setupRan = false;
    let cleanupRan = false;

    afterEach(() => {
      // Reset the flags after each test
      setupRan = false;
      cleanupRan = false;
    });

    cytest('Test with tag and hooks', 
      {
        tags: 'critical',
        before: () => {
          cy.log('Running setup for critical test');
          setupRan = true;
        },
        after: () => {
          cy.log('Running cleanup for critical test');
          cleanupRan = true;
        }
      }, 
      () => {
        cy.log('This test has a "critical" tag and before/after hooks');
        expect(setupRan).to.be.true;
        cy.wrap(cleanupRan).should('be.false'); // Cleanup hasn't run yet
      }
    );
  });

  context('Tests with Skip and Only', () => {
    // Test that skip works with tags
    cytest.skip('Skipped test with tag', 
      { tags: 'skipped' }, 
      () => {
        cy.log('This test should be skipped regardless of the tag');
        cy.wrap(false).should('be.true'); // This would fail if the test ran
      }
    );

    // Note: In a real test, you would use only one of these tests with .only()
    // Uncomment to test .only() functionality with tags
    // cytest.only('Only test with tag', 
    //   { tags: 'only' }, 
    //   () => {
    //     cy.log('This would be the only test that runs');
    //     cy.wrap(true).should('be.true');
    //   }
    // );
  });
});