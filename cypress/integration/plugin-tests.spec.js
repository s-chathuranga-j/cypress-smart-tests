import {configure, cytest, defineTestDependencies, resetState} from "../../src";

describe('Cypress Smart Tests Integration Tests', () => {
    before(() => {
        cy.log('Global before all hook');
    });
    beforeEach(() => {
        resetState();
        configure({ failFast: true });
        defineTestDependencies({
            'Parent Test': ['Dependent Test 1', 'Dependent Test 2'],
        });
        cy.log('Global before hook');
    });

    afterEach(() => {
        cy.log('Global after hook');
    });

    cytest('Verify Run if works with test based hook', {
        before: () => {
            cy.log('Before hook within test');
            Cypress.env('runTest', true);
        },
        after: () => {
            cy.log('After hook within test');
            Cypress.env('runTest', false);
        },
        runIf: () => {
            return Cypress.env('runTest');
        }
    }, () => {
        cy.log('Test body');
    });

    cytest('Run if env value is true with hooks', {
        before: () => {
            cy.log('Before hook within test');
        },
        after: () => {
            cy.log('After hook within test');
        },
        runIf: () => {
            return Cypress.env('runTest');
        }
    }, () => {
        cy.log('Test body');
    });

    cytest('Parent Test', () => {
        cy.wrap(false).should('be.true');
    });

    cytest('Dependent Test 1', () => {
        cy.log('This test should be skipped because Parent Test failed');
    });

    cytest('Dependent Test 2', () => {
        console.log('This test should also be skipped because Parent Test failed');
    });

    cytest('Normal test after dependencies', () => {
        cy.log('This test should always run');
    });
});