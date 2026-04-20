# Logifuture API Technical Task

This project implements an automated API testing suite for the Wallet Transactions API using Cypress as an HTTP client. The goal is to validate the core business logic of wallet operations, including credit/debit behavior, multi‑currency handling, validation, and error responses. The framework is intentionally lightweight, maintainable, and structured using a layered architecture.

------------------------------------------------------------
## Setup & Dependencies

### Install dependencies
npm install

### Required environment variables
- API_BASE_URL  
- username  
- password  
- serviceId  

You may pass them via CLI:

API_BASE_URL="https://api.example.com" npx cypress run --env username=myuser,password=mypass,serviceId=my-service

Or create a local cypress.env.json:

{
  "username": "myuser",
  "password": "mypass",
  "serviceId": "my-service"
}

### Tech stack
- Cypress (API-only)
- Node.js / npm
- currency-codes (realistic currency generation)
- Mochawesome (reporting)
- Prettier (code formatting and consistency)

------------------------------------------------------------
## Project Structure

cypress/
  api/
    wallet.api.js              # Low-level HTTP client for wallet endpoints
  service/
    wallet.service.js          # Business logic + polling for async transactions
  e2e/
    wallet.transactions.cy.js  # Main test suite
  support/
    commands.js                # login, getWalletId
    e2e.js                     # global support file
    helpers/
      resetWallet.js           # drains wallet to zero (with defensive guard)
      seedWallet.js            # seeds deterministic EUR/USD/GBP clips
  utils/
    dataFactory.js             # valid + invalid transaction generators
cypress.config.js
package.json
README.md
TESTPLAN.md

------------------------------------------------------------
## Running the Tests

### Headless
npm run headless   
or  
npx cypress run

### Interactive
npm run interative
or
npx cypress open  
Then select: wallet.transactions.cy.js

------------------------------------------------------------
## Execution Notes

- Tests authenticate using /user/login and retrieve walletId dynamically.
- resetWallet() ensures a clean wallet state before each test.
- seedWalletWithClips() creates deterministic EUR/USD/GBP clips.
- waitForTransaction() supports pending → finished flows, although the backend does not expose a deterministic way to force pending.
- All tests are idempotent and independent.

------------------------------------------------------------
## Additional Notes

This project was built specifically for the Logifuture API Technical Task and meets all requirements:
- README included
- TESTPLAN included
- 5–10 implemented tests (6 implemented)
- Up to 5 unimplemented but important tests documented
- No brittle or hardcoded data
- Clear assumptions documented

**This project was developed with assistance from Microsoft Copilot.**
