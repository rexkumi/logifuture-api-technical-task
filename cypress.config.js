const { defineConfig } = require('cypress');

module.exports = defineConfig({
  allowCypressEnv: false,

  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: true,
    json: true,
  },

  e2e: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    retries: {
      runMode: 1,
      openMode: 0,
    },
    video: false,
    screenshotOnRunFailure: false,
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
