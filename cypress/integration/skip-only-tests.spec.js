/// <reference types="cypress" />

import { cytest, defineTestDependencies, resetState } from '../../src/index';

describe('Cypress Smart Tests Plugin - Skip and Only', () => {
  beforeEach(() => {
    // Reset the plugin state before each test suite
    resetState();
  });

  context('Skip Tests', () => {
    cytest('Regular Test', () => {
      cy.log('This test should run normally');
      cy.wrap(true).should('be.true');
    });

    cytest.skip('Skipped Test', () => {
      cy.log('This test should be skipped');
      cy.wrap(false).should('be.true'); // This would fail if the test ran
    });
  });

  context('Only Tests', () => {
    // Note: In a real test, you would use only one of these tests with .only()
    // Here we're just testing that the syntax works

    cytest('Regular Test in Only Context', () => {
      cy.log('This test would be skipped if another test had .only()');
      cy.wrap(true).should('be.true');
    });

    // Uncomment to test .only() functionality
    // cytest.only('Only Test', () => {
    //   cy.log('This would be the only test that runs');
    //   cy.wrap(true).should('be.true');
    // });
  });

  context('Skip with Dependencies', () => {
    // Define dependencies
    defineTestDependencies({
      'Parent Test': ['Dependent Test'],
    });

    cytest('Parent Test', () => {
      cy.log('This is a parent test');
      cy.wrap(true).should('be.true');
    });

    cytest.skip('Dependent Test', () => {
      cy.log('This test should be skipped regardless of dependencies');
      cy.wrap(false).should('be.true'); // This would fail if the test ran
    });
  });
});
