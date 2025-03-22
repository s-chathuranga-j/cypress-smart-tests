const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/integration/**/*.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/index.js',
    fixturesFolder: 'cypress/fixtures',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      // This replaces the pluginsFile configuration
      return require('./cypress/plugins/index.js')(on, config);
    },
  },
  video: false,
  screenshotOnRunFailure: false,
  defaultCommandTimeout: 5000,
  viewportWidth: 1280,
  viewportHeight: 720,
});
