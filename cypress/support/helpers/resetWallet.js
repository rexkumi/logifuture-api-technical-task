const walletService = require('../../service/wallet.service.js');
const { generateTransaction } = require('../../utils/dataFactory');

const resetWallet = (walletId) => {
  return walletService.getWallet(walletId).then((response) => {
    const clips = response.body.currencyClips || [];

    return Cypress._.reduce(
      clips,
      (chain, clip) => {
        if (!clip || typeof clip.balance !== 'number') {
          return chain;
        }
        if (clip.balance > 0) {
          const data = generateTransaction({
            type: 'debit',
            currency: clip.currency,
            amount: clip.balance,
          });

          return chain.then(() => {
            return walletService.createTransaction(walletId, data).then((transactionResponse) => {
              if (transactionResponse.body.status === 'pending') {
                return walletService.waitForTransaction(
                  walletId,
                  transactionResponse.body.transactionId
                );
              }
            });
          });
        }

        return chain;
      },
      cy.wrap(null)
    );
  });
};

module.exports = { resetWallet };
