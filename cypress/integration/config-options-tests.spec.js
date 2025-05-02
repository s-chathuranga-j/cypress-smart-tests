/// <reference types="cypress" />

import { cytest, resetState } from '../../src/index';

describe('Cypress Smart Tests Plugin - Config Options', () => {
  beforeEach(() => {
    // Reset the plugin state before each test suite
    resetState();
  });

  context('Tests with baseUrl option', () => {
    // This test uses the baseUrl option
    cytest('Test with baseUrl option', 
      { baseUrl: 'https://example.com' },
      () => {
        cy.log('This test should use the baseUrl from the test options');
        // Visit the root path, which should use the baseUrl from the test options
        cy.visit('/');
        // The URL should include the baseUrl
        cy.url().should('include', 'example.com');
      }
    );

    // This test uses the baseUrl option with skip
    cytest.skip('Skipped test with baseUrl option', 
      { baseUrl: 'https://example.com' },
      () => {
        cy.log('This test should be skipped');
        cy.wrap(false).should('be.true'); // This would fail if the test ran
      }
    );

    // This test uses the baseUrl option with only (commented out to avoid affecting other tests)
    // cytest.only('Only test with baseUrl option', 
    //   { baseUrl: 'https://example.com' },
    //   () => {
    //     cy.log('This would be the only test that runs');
    //     cy.visit('/');
    //     cy.url().should('include', 'example.com');
    //   }
    // );
  });

  context('Tests with multiple config options', () => {
    // This test uses multiple config options
    cytest('Test with multiple config options', 
      { 
        baseUrl: 'https://example.com',
        viewportWidth: 800,
        viewportHeight: 600,
        tags: 'config-test'
      },
      () => {
        cy.log('This test should use multiple config options');
        cy.visit('/');
        cy.url().should('include', 'example.com');
        // The viewport should be set to the specified dimensions
        cy.viewport(800, 600);
      }
    );
  });

  context('Tests with config options and cytest options', () => {
    // This test uses both config options and cytest-specific options
    cytest('Test with config and cytest options', 
      { 
        baseUrl: 'https://example.com',
        tags: '@config-test, @tagtest',
        runIf: () => true,
        before: () => {
          cy.log('Running setup for test with config options');
        },
        after: () => {
          cy.log('Running cleanup for test with config options');
        }
      },
      () => {
        cy.log('This test should use both config options and cytest-specific options');
        cy.visit('/');
        cy.url().should('include', 'example.com');
      }
    );
  });
});