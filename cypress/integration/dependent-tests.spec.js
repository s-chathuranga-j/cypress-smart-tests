/// <reference types="cypress" />

import { dependentIt, defineTestDependencies, configure, resetState } from '../../src/index';

describe('Cypress Dependent Tests Plugin', () => {
  beforeEach(() => {
    // Reset the plugin state before each test suite
    resetState();
  });

  context('Basic Dependencies', () => {
    // Define dependencies
    defineTestDependencies({
      'Parent Test': ['Dependent Test 1', 'Dependent Test 2'],
    });

    dependentIt('Parent Test', () => {
      // This test will pass
      cy.wrap(true).should('be.true');
    });

    dependentIt('Dependent Test 1', () => {
      cy.log('This test should run because Parent Test passed');
      cy.wrap(true).should('be.true');
    });

    dependentIt('Dependent Test 2', () => {
      cy.log('This test should also run because Parent Test passed');
      cy.wrap(true).should('be.true');
    });

    dependentIt('Independent Test', () => {
      cy.log('This test should always run');
      cy.wrap(true).should('be.true');
    });
  });

  context('Failed Parent Test', () => {
    // Define dependencies
    defineTestDependencies({
      'Failing Parent Test': ['Skipped Test 1', 'Skipped Test 2'],
    });

    dependentIt('Failing Parent Test', () => {
      // This test will fail
      cy.wrap(false).should('be.true');
    });

    dependentIt('Skipped Test 1', () => {
      cy.log('This test should be skipped because Failing Parent Test failed');
      cy.wrap(true).should('be.true');
    });

    dependentIt('Skipped Test 2', () => {
      cy.log('This test should also be skipped because Failing Parent Test failed');
      cy.wrap(true).should('be.true');
    });

    dependentIt('Still Running Test', () => {
      cy.log('This test should still run because it has no dependencies');
      cy.wrap(true).should('be.true');
    });
  });

  context('Complex Dependencies', () => {
    // Define complex dependencies
    defineTestDependencies({
      'Root Test': ['Level 1 Test A', 'Level 1 Test B'],
      'Level 1 Test A': ['Level 2 Test'],
    });

    dependentIt('Root Test', () => {
      // This test will pass
      cy.wrap(true).should('be.true');
    });

    dependentIt('Level 1 Test A', () => {
      // This test will fail
      cy.wrap(false).should('be.true');
    });

    dependentIt('Level 1 Test B', () => {
      cy.log('This test should run because it only depends on Root Test');
      cy.wrap(true).should('be.true');
    });

    dependentIt('Level 2 Test', () => {
      cy.log('This test should be skipped because Level 1 Test A failed');
      cy.wrap(true).should('be.true');
    });
  });

  context('FailFast Mode', () => {
    beforeEach(() => {
      // Configure failFast mode
      configure({ failFast: true });
      
      // Define dependencies
      defineTestDependencies({
        'Critical Test': ['Subsequent Test 1', 'Subsequent Test 2'],
      });
    });

    dependentIt('Critical Test', () => {
      // This test will fail
      cy.wrap(false).should('be.true');
    });

    dependentIt('Subsequent Test 1', () => {
      cy.log('This test should be skipped in failFast mode');
      cy.wrap(true).should('be.true');
    });

    dependentIt('Subsequent Test 2', () => {
      cy.log('This test should also be skipped in failFast mode');
      cy.wrap(true).should('be.true');
    });
  });
});