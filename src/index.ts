/**
 * cypress-dependent-tests
 * A Cypress plugin to manage dependencies between test cases
 */

// Global state to track test results
interface TestState {
  [testName: string]: boolean | null; // true = passed, false = failed, null = not run yet
}

interface TestDependencies {
  [parentTest: string]: string[]; // parent test -> dependent tests
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
let testState: TestState = {};
let testDependencies: TestDependencies = {};
let config: PluginConfig = { ...defaultConfig };

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
  testState = {};
  testDependencies = {};
  config = { ...defaultConfig };
}

/**
 * Check if a test should be skipped based on its dependencies
 * @param testName The name of the test
 * @returns true if the test should be skipped, false otherwise
 */
function shouldSkipTest(testName: string): boolean {
  // Find all parent tests that this test depends on
  const parentTests = Object.entries(testDependencies)
    .filter(([_, dependents]) => dependents.includes(testName))
    .map(([parent, _]) => parent);

  // If any parent test has failed, skip this test
  return parentTests.some(parent => testState[parent] === false);
}

/**
 * A wrapper around Cypress's it() function that respects test dependencies
 * @param name The name of the test
 * @param fn The test function
 */
export function dependentIt(name: string, fn: () => void): Cypress.Chainable {
  // Initialize test state
  if (testState[name] === undefined) {
    testState[name] = null;
  }

  // Use Cypress's it() function
  return it(name, function() {
    // Check if this test should be skipped
    if (shouldSkipTest(name)) {
      const parentTests = Object.entries(testDependencies)
        .filter(([_, dependents]) => dependents.includes(name))
        .map(([parent, _]) => parent)
        .filter(parent => testState[parent] === false);
      
      const parentTest = parentTests[0]; // Just take the first failed parent for the message
      
      cy.log(`Skipping test "${name}" because its dependency "${parentTest}" failed`);
      this.skip(); // Skip this test
      return;
    }

    // Create a promise to track test result
    const testPromise = new Promise<void>((resolve, reject) => {
      try {
        // Run the test function
        const result = fn.call(this);
        
        // Handle both synchronous and asynchronous test functions
        if (result && typeof result.then === 'function') {
          result
            .then(() => {
              testState[name] = true; // Mark as passed
              resolve();
            })
            .catch((err: Error) => {
              testState[name] = false; // Mark as failed
              reject(err);
            });
        } else {
          testState[name] = true; // Mark as passed
          resolve();
        }
      } catch (err) {
        testState[name] = false; // Mark as failed
        reject(err);
      }
    });

    // Return the promise to Cypress
    return cy.wrap(testPromise, { log: false });
  });
}

// Hook into Cypress's afterEach to track test results
afterEach(function() {
  const currentTest = this.currentTest;
  if (currentTest) {
    const testName = currentTest.title;
    testState[testName] = currentTest.state === 'passed';
    
    // If failFast is enabled and this test failed, fail the whole suite
    if (config.failFast && !testState[testName]) {
      const dependents = testDependencies[testName] || [];
      if (dependents.length > 0) {
        cy.log(`Test "${testName}" failed. Skipping dependent tests: ${dependents.join(', ')}`);
      }
    }
  }
});