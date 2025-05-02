/// <reference types="cypress" />

import { cytest, resetState } from '../../src/index';

describe('Cypress Smart Tests Plugin - Comma Separated Tags', () => {
  beforeEach(() => {
    // Reset the plugin state before each test suite
    resetState();
  });

  context('Tests with Comma Separated Tags', () => {
    cytest('Test with comma separated tags', 
      { tags: '@smoke, @regression' },
      () => {
        cy.log('This test has both @smoke and @regression tags in a single string');
        cy.wrap(true).should('be.true');
      }
    );

    cytest('Another test with only smoke tag', 
      { tags: '@smoke' },
      () => {
        cy.log('This test has only the @smoke tag');
        cy.wrap(true).should('be.true');
      }
    );

    cytest('Test with regression tag only', 
      { tags: '@regression' },
      () => {
        cy.log('This test has only the @regression tag');
        cy.wrap(true).should('be.true');
      }
    );

    cytest('Test with different tag', 
      { tags: '@other' },
      () => {
        cy.log('This test has a different tag');
        cy.wrap(true).should('be.true');
      }
    );
  });
});