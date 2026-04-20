const walletApi = require('../api/wallet.api');

const DEFAULT_POLL_RETRIES = 5;
const DEFAULT_POLL_DELAY_MS = 500;

class WalletService {
  createTransaction(walletId, data) {
    return walletApi.createTransaction(walletId, data);
  }

  getWallet(walletId) {
    return walletApi.getWallet(walletId).then((response) => {
    // Basic safety validation to ensure we have a valid response before proceeding
      expect(response.status).to.be.oneOf([200, 404, 401]);
      return response;
    });
  }

  getTransaction(walletId, transactionId) {
    return walletApi.getTransaction(walletId, transactionId);
  }

  waitForTransaction(walletId, transactionId, retries = DEFAULT_POLL_RETRIES) {
    return walletApi.getTransaction(walletId, transactionId).then((response) => {
      if (!response.body || !response.body.status) {
        throw new Error(`Invalid transaction response for transactionId=${transactionId}`);
      }

      if (response.body.status === 'finished') {
        return response;
      }

      if (retries === 0) {
        throw new Error(`Transaction ${transactionId} did not finish in time`);
      }

      cy.wait(DEFAULT_POLL_DELAY_MS);
      return this.waitForTransaction(walletId, transactionId, retries - 1);
    });
  }
}

module.exports = new WalletService();
