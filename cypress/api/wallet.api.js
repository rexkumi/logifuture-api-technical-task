class WalletApi {
  createTransaction(walletId, body) {
    return cy.request({
      method: 'POST',
      url: `/wallet/${walletId}/transaction`,
      headers: {
        Authorization: `Bearer ${Cypress.env('token')}`,
      },
      body,
      failOnStatusCode: false,
    });
  }

  getWallet(walletId) {
    return cy.request({
      method: 'GET',
      url: `/wallet/${walletId}`,
      headers: {
        Authorization: `Bearer ${Cypress.env('token')}`,
      },
      failOnStatusCode: false,
    });
  }

  getTransaction(walletId, txId) {
    return cy.request({
      method: 'GET',
      url: `/wallet/${walletId}/transaction/${txId}`,
      headers: {
        Authorization: `Bearer ${Cypress.env('token')}`,
      },
      failOnStatusCode: false,
    });
  }
}

module.exports = new WalletApi();
