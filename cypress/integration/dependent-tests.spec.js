/// <reference types="cypress" />

import { cytest, defineTestDependencies, configure, resetState } from '../../src/index';

describe('Cypress Smart Tests Plugin - Dependencies', () => {
  beforeEach(() => {
    // Reset the plugin state before each test suite
    resetState();
  });

  context('Simple Dependent Test Execution', () => {
    beforeEach(() => {
      // Configure failFast mode
      configure({ failFast: true });

      // Define dependencies
      defineTestDependencies({
        'Critical Test': ['Subsequent Test 1', 'Subsequent Test 2'],
      });
    });

    cytest('Critical Test', () => {
      // This test will fail
      cy.wrap(false).should('be.true');
    });

    cytest('Subsequent Test 1', () => {
      cy.log('This test should be skipped in failFast mode');
      cy.wrap(true).should('be.true');
    });

    cytest('Subsequent Test 2', () => {
      cy.log('This test should also be skipped in failFast mode');
      cy.wrap(true).should('be.true');
    });

    cytest('Subsequent Test 3', () => {
      cy.log('This test should not be skipped in failFast mode');
      cy.wrap(true).should('be.true');
    });
  });

  context('Complex Dependent Test Execution', () => {
    beforeEach(() => {
      // Configure failFast mode
      configure({ failFast: true });

      // Define dependencies
      defineTestDependencies({
        'Critical Test': ['Subsequent Test 1', 'Subsequent Test 2'],
        'Other Critical Test': ['Subsequent Test 4'],
      });
    });

    cytest('Critical Test', () => {
      // This test will fail
      cy.wrap(false).should('be.true');
    });

    cytest('Subsequent Test 1', () => {
      cy.log('This test should be skipped in failFast mode');
      cy.wrap(true).should('be.true');
    });

    cytest('Subsequent Test 2', () => {
      cy.log('This test should also be skipped in failFast mode');
      cy.wrap(true).should('be.true');
    });

    cytest('Subsequent Test 3', () => {
      cy.log('This test should not be skipped in failFast mode');
      cy.wrap(true).should('be.true');
    });

    cytest('Other Critical Test', () => {
      // This test will fail
      cy.wrap(false).should('be.true');
    });

    cytest('Subsequent Test 4', () => {
      cy.log('This test should be skipped in failFast mode');
      cy.wrap(true).should('be.true');
    });

    cytest('Subsequent Test 6', () => {
      cy.log('This test should not be skipped in failFast mode');
      cy.wrap(true).should('be.true');
    });
  });
});
