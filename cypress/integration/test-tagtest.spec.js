/// <reference types="cypress" />

import { cytest, resetState } from '../../src/index';

describe('Cypress Smart Tests Plugin - Test TagTest', () => {
  beforeEach(() => {
    // Reset the plugin state before each test suite
    resetState();
  });

  context('Tests with @tagtest tag', () => {
    cytest('Test with @tagtest tag', 
      { tags: '@tagtest' },
      () => {
        cy.log('This test has the @tagtest tag');
        cy.wrap(true).should('be.true');
      }
    );

    cytest('Another test with @tagtest tag', 
      { tags: ['@tagtest', '@another'] },
      () => {
        cy.log('This test has both @tagtest and @another tags');
        cy.wrap(true).should('be.true');
      }
    );
  });

  context('Tests without @tagtest tag', () => {
    cytest('Test without @tagtest tag', 
      { tags: '@other' },
      () => {
        cy.log('This test has the @other tag');
        cy.wrap(true).should('be.true');
      }
    );
  });
});