const walletService = require('../../service/wallet.service');
const { generateTransaction } = require('../../utils/dataFactory');

const seedWalletWithClips = (walletId) => {
  const currencies = ['EUR', 'USD', 'GBP'];

  return cy.then(() =>
    Cypress._.reduce(
      currencies,
      (chain, currency) =>
        chain.then(() => {
          const data = generateTransaction({
            type: 'credit',
            currency,
            amount,
          });

          return walletService.createTransaction(walletId, data).then((response) => {
            const transactionId = response.body.transactionId;

            if (response.body.status === 'pending') {
              return walletService.waitForTransaction(walletId, transactionId);
            }
          });
        }),
      cy.wrap(null)
    )
  );
};

module.exports = { seedWalletWithClips };
