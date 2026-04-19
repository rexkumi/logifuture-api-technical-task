const walletApi = require('../api/wallet.api');

class WalletService {
  createTransaction(walletId, data) {
    return walletApi.createTransaction(walletId, data).then((res) => {
      return res;
    });
  }

  waitForTransaction(walletId, txId, retries = 5) {
    return walletApi.getTransaction(walletId, txId).then((res) => {
      if (!res.body || !res.body.status) {
        throw new Error('Invalid transaction response');
      }

      if (res.body.status === 'finished') {
        return res;
      }

      if (retries === 0) {
        throw new Error('Transaction did not finish in time');
      }

      cy.wait(500);
      return this.waitForTransaction(walletId, txId, retries - 1);
    });
  }
}

module.exports = new WalletService();
