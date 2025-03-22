/// <reference types="cypress" />

import { cytest, defineTestDependencies, configure, resetState } from '../../src/index';

describe('Cypress Smart Tests Plugin - Dependencies', () => {
  beforeEach(() => {
    // Reset the plugin state before each test suite
    resetState();
  });

  context('Basic Dependencies', () => {
    // Define dependencies
    defineTestDependencies({
      'Parent Test': ['Dependent Test 1', 'Dependent Test 2'],
    });

    cytest('Parent Test', () => {
      // This test will pass
      cy.wrap(true).should('be.true');
    });

    cytest('Dependent Test 1', () => {
      cy.log('This test should run because Parent Test passed');
      cy.wrap(true).should('be.true');
    });

    cytest('Dependent Test 2', () => {
      cy.log('This test should also run because Parent Test passed');
      cy.wrap(true).should('be.true');
    });

    cytest('Independent Test', () => {
      cy.log('This test should always run');
      cy.wrap(true).should('be.true');
    });
  });

  context('Failed Parent Test', () => {
    // Define dependencies
    defineTestDependencies({
      'Failing Parent Test': ['Skipped Test 1', 'Skipped Test 2'],
    });

    cytest('Failing Parent Test', () => {
      // This test will fail
      cy.wrap(false).should('be.true');
    });

    cytest('Skipped Test 1', () => {
      cy.log('This test should be skipped because Failing Parent Test failed');
      cy.wrap(true).should('be.true');
    });

    cytest('Skipped Test 2', () => {
      cy.log('This test should also be skipped because Failing Parent Test failed');
      cy.wrap(true).should('be.true');
    });

    cytest('Still Running Test', () => {
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

    cytest('Root Test', () => {
      // This test will pass
      cy.wrap(true).should('be.true');
    });

    cytest('Level 1 Test A', () => {
      // This test will fail
      cy.wrap(false).should('be.true');
    });

    cytest('Level 1 Test B', () => {
      cy.log('This test should run because it only depends on Root Test');
      cy.wrap(true).should('be.true');
    });

    cytest('Level 2 Test', () => {
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
});
