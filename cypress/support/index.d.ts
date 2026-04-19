declare namespace Cypress {
  interface Chainable {
    login(): Chainable<any>;
    getWalletId(): Chainable<string>;
  }
}
