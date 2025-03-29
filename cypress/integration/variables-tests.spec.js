/// <reference types="cypress" />

import { cytest, cyVariable, cyVariables, resetState } from '../../src/index';

describe('Cypress Smart Tests Plugin - Persistent Variables', () => {
  beforeEach(() => {
    // Reset the plugin state but keep variables
    resetState();
  });

  context('Basic Variable Usage', () => {
    // Set up a variable before tests
    before(() => {
      cyVariable('testVar', 'initial value');
    });

    cytest('Set and get a variable', () => {
      // Set a variable
      cyVariable('username', 'testuser');
      
      // Get the variable
      const username = cyVariable('username');
      
      // Verify the variable was set correctly
      expect(username).to.equal('testuser');
    });

    cytest('Variable persists across tests', () => {
      // Get the variable set in the previous test
      const username = cyVariable('username');
      
      // Verify the variable still has the same value
      expect(username).to.equal('testuser');
      
      // Update the variable
      cyVariable('username', 'updateduser');
      
      // Verify the update worked
      expect(cyVariable('username')).to.equal('updateduser');
    });

    cytest('Variables can store different types', () => {
      // Store a number
      cyVariable('count', 42);
      expect(cyVariable('count')).to.equal(42);
      
      // Store an object
      const user = { id: 1, name: 'Test User', active: true };
      cyVariable('user', user);
      expect(cyVariable('user')).to.deep.equal(user);
      
      // Store an array
      const items = ['item1', 'item2', 'item3'];
      cyVariable('items', items);
      expect(cyVariable('items')).to.deep.equal(items);
      
      // Store a boolean
      cyVariable('isActive', true);
      expect(cyVariable('isActive')).to.be.true;
    });

    cytest('Variable set in before hook is available', () => {
      // Get the variable set in the before hook
      const testVar = cyVariable('testVar');
      
      // Verify the variable has the expected value
      expect(testVar).to.equal('initial value');
    });
  });

  context('Multiple Variables Management', () => {
    before(() => {
      // Reset variables to ensure a clean state
      resetState(true);
    });

    cytest('Add and get variables', () => {
      // Add variables
      cyVariables().add('username', 'testuser');
      cyVariables().add('userId', 123);
      cyVariables().add('userPreferences', { theme: 'dark', language: 'en' });
      
      // Get variables
      const username = cyVariables().get('username');
      const userId = cyVariables().get('userId');
      const userPreferences = cyVariables().get('userPreferences');
      
      // Verify variables were set correctly
      expect(username).to.equal('testuser');
      expect(userId).to.equal(123);
      expect(userPreferences).to.deep.equal({ theme: 'dark', language: 'en' });
    });

    cytest('Check if variables exist', () => {
      // Check existing variables
      expect(cyVariables().has('username')).to.be.true;
      expect(cyVariables().has('userId')).to.be.true;
      expect(cyVariables().has('userPreferences')).to.be.true;
      
      // Check non-existing variable
      expect(cyVariables().has('nonExistingVar')).to.be.false;
    });

    cytest('Get all variables', () => {
      // Get all variables
      const allVariables = cyVariables().getAll();
      
      // Verify all variables are returned
      expect(allVariables).to.deep.equal({
        username: 'testuser',
        userId: 123,
        userPreferences: { theme: 'dark', language: 'en' }
      });
    });

    cytest('Remove a variable', () => {
      // Remove a variable
      cyVariables().remove('username');
      
      // Verify the variable was removed
      expect(cyVariables().has('username')).to.be.false;
      
      // Other variables should still exist
      expect(cyVariables().has('userId')).to.be.true;
      expect(cyVariables().has('userPreferences')).to.be.true;
    });

    cytest('Clear all variables', () => {
      // Clear all variables
      cyVariables().clear();
      
      // Verify all variables were cleared
      expect(cyVariables().getAll()).to.deep.equal({});
      expect(cyVariables().has('userId')).to.be.false;
      expect(cyVariables().has('userPreferences')).to.be.false;
    });
  });

  context('Variables with resetState', () => {
    before(() => {
      // Set up some variables
      cyVariable('testVar1', 'value1');
      cyVariable('testVar2', 'value2');
    });

    cytest('Variables persist after normal resetState', () => {
      // Reset state without resetting variables
      resetState();
      
      // Variables should still exist
      expect(cyVariable('testVar1')).to.equal('value1');
      expect(cyVariable('testVar2')).to.equal('value2');
    });

    cytest('Variables are cleared with resetState(true)', () => {
      // Reset state and variables
      resetState(true);
      
      // Variables should be cleared
      expect(cyVariable('testVar1')).to.be.undefined;
      expect(cyVariable('testVar2')).to.be.undefined;
    });
  });

  context('Practical Examples', () => {
    before(() => {
      // Reset variables to ensure a clean state
      resetState(true);
    });

    cytest('Store user credentials for reuse', () => {
      // Store user credentials
      cyVariables().add('credentials', {
        username: 'testuser',
        password: 'password123'
      });
      
      // Verify credentials were stored
      const credentials = cyVariables().get('credentials');
      expect(credentials.username).to.equal('testuser');
      expect(credentials.password).to.equal('password123');
      
      // Simulate login
      cy.log(`Logging in with username: ${credentials.username}`);
    });

    cytest('Use stored credentials in another test', () => {
      // Get credentials from previous test
      const credentials = cyVariables().get('credentials');
      
      // Verify credentials are still available
      expect(credentials).to.not.be.undefined;
      expect(credentials.username).to.equal('testuser');
      
      // Simulate using credentials
      cy.log(`Using stored credentials for user: ${credentials.username}`);
    });

    cytest('Store and update test data', () => {
      // Store initial test data
      cyVariable('testData', { id: 1, status: 'pending' });
      
      // Simulate updating the data
      const testData = cyVariable('testData');
      testData.status = 'completed';
      cyVariable('testData', testData);
      
      // Verify the update
      expect(cyVariable('testData').status).to.equal('completed');
    });
  });
});