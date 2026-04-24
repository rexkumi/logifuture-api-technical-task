const walletApi = require('../api/wallet.api');

const DEFAULT_POLL_RETRIES = 10;
const DEFAULT_POLL_DELAY_MS = 500;

class WalletService {
  createTransaction(walletId, data) {
    return walletApi.createTransaction(walletId, data);
  }

  getWallet(walletId) {
    return walletApi.getWallet(walletId);
  }

  getTransaction(walletId, transactionId) {
    return walletApi.getTransaction(walletId, transactionId);
  }

  waitForTransaction(walletId, transactionId, retries = DEFAULT_POLL_RETRIES) {
    return walletApi.getTransaction(walletId, transactionId).then((response) => {
      if (!response.body || !response.body.status) {
        throw new Error(`Invalid transaction response for transactionId=${transactionId}`);
      }

      if (response.body?.status === 'finished') {
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
