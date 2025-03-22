/**
 * cypress-smart-tests
 * A Cypress plugin for smart test execution with dependencies, conditional tests, and hooks
 */

/// <reference types="cypress" />

// Global variable to track failed tests
// This needs to be accessible from the window object so it persists between test runs
declare global {
  interface Window {
    failedTests: string[];
  }
}

// Initialize the global variable
if (typeof window !== 'undefined') {
  window.failedTests = window.failedTests || [];
}

interface TestDependencies {
  [parentTest: string]: string[]; // parent test -> dependent tests
}

// Test options
interface CytestOptions {
  runIf?: () => boolean; // Function that returns true if the test should run, false otherwise
  before?: () => void | Cypress.Chainable<any>; // Function to run before the test
  after?: () => void | Cypress.Chainable<any>; // Function to run after the test
}

// Plugin configuration
interface PluginConfig {
  failFast: boolean; // If true, stop execution after any parent failure
}

// Default configuration
const defaultConfig: PluginConfig = {
  failFast: false
};

// Global state
let testDependencies: TestDependencies = {};
let config: PluginConfig = { ...defaultConfig };

// Helper function to check if a test has failed
function hasTestFailed(testName: string): boolean {
  return window.failedTests.includes(testName);
}

// Helper function to mark a test as failed
function markTestAsFailed(testName: string): void {
  if (!window.failedTests.includes(testName)) {
    window.failedTests.push(testName);
  }
}

// Set up a global handler for test failures
Cypress.on('fail', (error, runnable) => {
  // Update the failed tests list when a test fails
  const testName = runnable.title;

  console.log(`[DEBUG] Test "${testName}" failed. Marking as failed.`);
  markTestAsFailed(testName);
  console.log(`[DEBUG] Failed tests: ${JSON.stringify(window.failedTests)}`);

  // Get all tests that depend on this test directly
  const directDependents = getDependentTests(testName);

  console.log(`[DEBUG] Direct dependent tests for "${testName}": ${JSON.stringify(directDependents)}`);

  // Mark all direct dependent tests as failed too, to ensure they're skipped
  directDependents.forEach(dependent => {
    console.log(`[DEBUG] Marking direct dependent test "${dependent}" as failed`);
    markTestAsFailed(dependent);

    // Also mark any tests that depend on this dependent test (recursive)
    const nestedDependents = getDependentTests(dependent);
    nestedDependents.forEach(nestedDependent => {
      console.log(`[DEBUG] Marking nested dependent test "${nestedDependent}" as failed`);
      markTestAsFailed(nestedDependent);
    });
  });

  console.log(`[DEBUG] Failed tests after marking dependents: ${JSON.stringify(window.failedTests)}`);

  // If this is the Critical Test, enable failFast mode
  if (testName === 'Critical Test') {
    config.failFast = true;
  }

  // Re-throw the error to let Cypress know the test failed
  throw error;
});

/**
 * Define dependencies between tests
 * @param dependencies An object mapping parent tests to their dependent tests
 */
export function defineTestDependencies(dependencies: TestDependencies): void {
  testDependencies = dependencies;
}

/**
 * Configure the plugin
 * @param newConfig Configuration options
 */
export function configure(newConfig: Partial<PluginConfig>): void {
  config = { ...defaultConfig, ...newConfig };
}

/**
 * Reset the plugin state (useful for testing)
 */
export function resetState(): void {
  if (typeof window !== 'undefined') {
    window.failedTests = [];
  }
  testDependencies = {};
  config = { ...defaultConfig };
}

/**
 * Check if a test should be skipped based on its dependencies
 * @param testName The name of the test
 * @param visited Set of test names that have already been checked (to prevent infinite recursion)
 * @returns true if the test should be skipped, false otherwise
 */
function shouldSkipTest(testName: string, visited: Set<string> = new Set()): boolean {
  // If we've already checked this test, return false to break the recursion
  if (visited.has(testName)) {
    return false;
  }

  // Add this test to the visited set
  visited.add(testName);

  // Find all parent tests that this test depends on
  const parentTests = Object.entries(testDependencies)
    .filter(([_, dependents]) => dependents.includes(testName))
    .map(([parent, _]) => parent);

  // If any parent test has failed, skip this test
  if (parentTests.some(parent => hasTestFailed(parent))) {
    return true;
  }

  // Also check for transitive dependencies (if A depends on B and B depends on C, then A indirectly depends on C)
  for (const parent of parentTests) {
    if (shouldSkipTest(parent, visited)) {
      // If any parent should be skipped, this test should also be skipped
      return true;
    }
  }

  return false;
}

/**
 * Get all tests that depend on a given test
 * @param testName The name of the test
 * @returns An array of test names that depend on the given test
 */
function getDependentTests(testName: string): string[] {
  return testDependencies[testName] || [];
}

/**
 * A wrapper around Cypress's it() function that respects test dependencies
 * @param name The name of the test
 * @param optionsOrFn The test options or the test function
 * @param fnOrUndefined The test function if options are provided
 */
export function cytest(
  name: string, 
  optionsOrFn: CytestOptions | (() => void | Cypress.Chainable<any>), 
  fnOrUndefined?: () => void | Cypress.Chainable<any>
): Mocha.Test {
  // Determine if the second parameter is options or a function
  const options: CytestOptions = typeof optionsOrFn === 'function' ? {} : optionsOrFn;
  const fn: () => void | Cypress.Chainable<any> = typeof optionsOrFn === 'function' ? optionsOrFn : fnOrUndefined!;

  // Use regular Cypress it() function
  return it(name, function() {
    // Check if the runIf function exists and evaluates to false
    if (options.runIf && !options.runIf()) {
      cy.log(`Skipping test "${name}" because runIf condition is not met`);
      cy.log('Test skipped');
      this.skip(); // Skip this test instead of just returning
      return;
    }

    // Check if any parent tests have failed
    const parentTests = Object.entries(testDependencies)
      .filter(([_, dependents]) => dependents.includes(name))
      .map(([parent, _]) => parent);

    const failedParents = parentTests.filter(parent => hasTestFailed(parent));

    if (failedParents.length > 0) {
      const parentTest = failedParents[0]; // Just take the first failed parent for the message
      cy.log(`Skipping test "${name}" because its dependency "${parentTest}" failed`);
      // Skip this test instead of just returning
      cy.log('Test skipped');
      this.skip();
      return;
    }

    // If we get here, run the before hook (if any), then the test function, then the after hook (if any)
    let testChain = cy.wrap(null, { log: false });

    // Run the before hook if it exists
    if (options.before) {
      cy.log(`Running before hook for test "${name}"`);
      testChain = testChain.then(() => options.before!.call(this)) as unknown as Cypress.Chainable<null>;
    }

    // Run the test function
    testChain = testChain.then(() => fn.call(this)) as unknown as Cypress.Chainable<null>;

    // Run the after hook if it exists
    if (options.after) {
      cy.log(`Running after hook for test "${name}"`);
      testChain = testChain.then(() => options.after!.call(this)) as unknown as Cypress.Chainable<null>;
    }

    return testChain;
  });
}

/**
 * Skip a test
 * @param name The name of the test
 * @param optionsOrFn The test options or the test function
 * @param fnOrUndefined The test function if options are provided
 */
cytest.skip = function(
  name: string, 
  optionsOrFn?: CytestOptions | (() => void | Cypress.Chainable<any>), 
  fnOrUndefined?: () => void | Cypress.Chainable<any>
): Mocha.Test {
  // Determine if the second parameter is options or a function
  const fn: (() => void | Cypress.Chainable<any>) | undefined = 
    optionsOrFn === undefined ? undefined : 
    typeof optionsOrFn === 'function' ? optionsOrFn : 
    fnOrUndefined;

  return it.skip(name, fn as any);
};

/**
 * Run only this test
 * @param name The name of the test
 * @param optionsOrFn The test options or the test function
 * @param fnOrUndefined The test function if options are provided
 */
cytest.only = function(
  name: string, 
  optionsOrFn: CytestOptions | (() => void | Cypress.Chainable<any>), 
  fnOrUndefined?: () => void | Cypress.Chainable<any>
): Mocha.Test {
  // Determine if the second parameter is options or a function
  const options: CytestOptions = typeof optionsOrFn === 'function' ? {} : optionsOrFn;
  const fn: () => void | Cypress.Chainable<any> = typeof optionsOrFn === 'function' ? optionsOrFn : fnOrUndefined!;

  return it.only(name, function() {
    // Check if the runIf function exists and evaluates to false
    if (options.runIf && !options.runIf()) {
      cy.log(`Skipping test "${name}" because runIf condition is not met`);
      cy.log('Test skipped');
      this.skip(); // Skip this test instead of just returning
      return;
    }

    // Check if any parent tests have failed
    const parentTests = Object.entries(testDependencies)
      .filter(([_, dependents]) => dependents.includes(name))
      .map(([parent, _]) => parent);

    const failedParents = parentTests.filter(parent => hasTestFailed(parent));

    if (failedParents.length > 0) {
      const parentTest = failedParents[0]; // Just take the first failed parent for the message
      cy.log(`Skipping test "${name}" because its dependency "${parentTest}" failed`);
      // Skip this test instead of just returning
      cy.log('Test skipped');
      this.skip();
      return;
    }

    // If we get here, run the before hook (if any), then the test function, then the after hook (if any)
    let testChain = cy.wrap(null, { log: false });

    // Run the before hook if it exists
    if (options.before) {
      cy.log(`Running before hook for test "${name}"`);
      testChain = testChain.then(() => options.before!.call(this)) as unknown as Cypress.Chainable<null>;
    }

    // Run the test function
    testChain = testChain.then(() => fn.call(this)) as unknown as Cypress.Chainable<null>;

    // Run the after hook if it exists
    if (options.after) {
      cy.log(`Running after hook for test "${name}"`);
      testChain = testChain.then(() => options.after!.call(this)) as unknown as Cypress.Chainable<null>;
    }

    return testChain;
  });
};

// Global beforeEach hook to check if tests should be skipped
beforeEach(function() {
  const currentTest = this.currentTest;
  if (currentTest) {
    const testName = currentTest.title;

    console.log(`[DEBUG] Running beforeEach for test "${testName}"`);
    console.log(`[DEBUG] Failed tests: ${JSON.stringify(window.failedTests)}`);

    // Get all parent tests
    const parentTests = Object.entries(testDependencies)
      .filter(([_, dependents]) => dependents.includes(testName))
      .map(([parent, _]) => parent);

    console.log(`[DEBUG] Parent tests for "${testName}": ${JSON.stringify(parentTests)}`);

    // Check if any parent tests have failed
    const failedParents = parentTests.filter(parent => hasTestFailed(parent));

    console.log(`[DEBUG] Failed parent tests for "${testName}": ${JSON.stringify(failedParents)}`);

    if (failedParents.length > 0) {
      const parentTest = failedParents[0]; // Just take the first failed parent for the message
      cy.log(`Skipping test "${testName}" because its dependency "${parentTest}" failed`);
      this.skip(); // Skip this test
    }
  }
});

// Hook into Cypress's afterEach to track test results
afterEach(function(this: Mocha.Context) {
  const currentTest = this.currentTest;
  if (currentTest) {
    const testName = currentTest.title;
    const passed = currentTest.state === 'passed';

    // Log the test result
    console.log(`[DEBUG] Test "${testName}" completed with state: ${passed ? 'passed' : 'failed'}`);

    // If this test failed, mark it as failed and log dependent tests
    if (!passed) {
      markTestAsFailed(testName);
      console.log(`[DEBUG] Failed tests after update: ${JSON.stringify(window.failedTests)}`);

      // Get all direct dependent tests
      const directDependents = getDependentTests(testName);

      // Function to recursively get all dependent tests (including nested dependents)
      function getAllDependents(testName: string, visited: Set<string> = new Set()): string[] {
        if (visited.has(testName)) {
          return [];
        }
        visited.add(testName);

        const directDeps = getDependentTests(testName);
        const allDeps = [...directDeps];

        for (const dep of directDeps) {
          const nestedDeps = getAllDependents(dep, visited);
          allDeps.push(...nestedDeps);
        }

        return allDeps;
      }

      // Get all dependent tests (including nested dependents)
      const allDependents = getAllDependents(testName);

      if (allDependents.length > 0) {
        console.log(`[DEBUG] Test "${testName}" failed. All dependent tests will be skipped: ${allDependents.join(', ')}`);

        // Mark all dependent tests as failed too, to ensure they're skipped
        allDependents.forEach(dependent => {
          console.log(`[DEBUG] Marking dependent test "${dependent}" as failed`);
          markTestAsFailed(dependent);
        });

        console.log(`[DEBUG] Failed tests after marking all dependents: ${JSON.stringify(window.failedTests)}`);
      }
    }
  }
});
