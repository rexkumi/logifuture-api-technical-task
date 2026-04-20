const walletService = require('../../service/wallet.service.js');
const { generateTransaction, generateInvalidTransaction } = require('../../utils/dataFactory');
const { resetWallet } = require('../../support/helpers/resetWallet');
const { seedWalletWithClips } = require('../../support/helpers/seedWallet');

describe('Wallet Transactions API', () => {
  let walletId;

  beforeEach(() => {
    cy.login();

    cy.getWalletId().then((id) => {
      walletId = id;
      return resetWallet(walletId);
    });
  });

  it('Creates a new currency clip on first credit', () => {
    const data = generateTransaction({ type: 'credit', currency: 'EUR' });

    walletService.createTransaction(walletId, data).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.transactionId).to.exist;
      if (response.body.status === 'finished') {
        expect(response.body.outcome).to.eq('approved');
      }
    });

    walletService.getWallet(walletId).then((response) => {
      const eurCurrencyClip = response.body.currencyClips.find((c) => c.currency === 'EUR');
      const ts = new Date(eurCurrencyClip.lastTransaction).getTime();
      const now = Date.now();

      expect(eurCurrencyClip).to.exist;
      expect(eurCurrencyClip.balance).to.be.greaterThan(0);
      expect(eurCurrencyClip.transactionCount).to.eq(1);
      // Assuming the transaction was processed within the last 5 seconds
      expect(now - ts).to.be.lessThan(5000);
    });
  });

  it('Accurately increases credited currency balance and leaves uncredited currencies unchanged', () => {
    seedWalletWithClips(walletId).then(() => {
      walletService.getWallet(walletId).then((initial) => {
        const clipsBefore = initial.body.currencyClips;

        const eurBefore = clipsBefore.find((c) => c.currency === 'EUR').balance;
        const usdBefore = clipsBefore.find((c) => c.currency === 'USD').balance;
        const gbpBefore = clipsBefore.find((c) => c.currency === 'GBP').balance;

        const amount = 25.5;

        const data = generateTransaction({
          type: 'credit',
          currency: 'EUR',
          amount,
        });

        walletService.createTransaction(walletId, data).then(() => {
          walletService.getWallet(walletId).then((updated) => {
            const clipsAfter = updated.body.currencyClips;

            const eurAfter = clipsAfter.find((c) => c.currency === 'EUR').balance;
            const usdAfter = clipsAfter.find((c) => c.currency === 'USD').balance;
            const gbpAfter = clipsAfter.find((c) => c.currency === 'GBP').balance;

            expect(eurAfter).to.equal(eurBefore + amount);

            expect(usdAfter).to.equal(usdBefore);
            expect(gbpAfter).to.equal(gbpBefore);
          });
        });
      });
    });
  });

  it('Returns denied outcome when the debitted amount exceeds the available balance', () => {
    seedWalletWithClips(walletId).then(() => {
      walletService.getWallet(walletId).then((initial) => {
        const clipsBefore = initial.body.currencyClips;

        const eurBefore = clipsBefore.find((c) => c.currency === 'EUR').balance;

        const data = { currency: 'EUR', amount: 999999, type: 'debit' };

        walletService.createTransaction(walletId, data).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.outcome).to.eq('denied');

          walletService.getWallet(walletId).then((updated) => {
            const clipsAfter = updated.body.currencyClips;

            const eurAfter = clipsAfter.find((c) => c.currency === 'EUR').balance;

            expect(eurAfter).to.equal(eurBefore);
          });
        });
      });
    });
  });

  it('Returns 400 when the transaction payload is invalid', () => {
    const data = generateInvalidTransaction();

    walletService.createTransaction(walletId, data).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('Returns 400 when attempting multiple credits in a single request', () => {
    const invalidPayload = {
      transactions: [
        { currency: 'EUR', amount: 50, type: 'credit' },
        { currency: 'USD', amount: 100, type: 'credit' },
      ],
    };

    walletService.createTransaction(walletId, invalidPayload).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.exist;
    });
  });

  it('Returns denied outcome when attempting to withdraw from a currency the users wallet does not hold', () => {
    seedWalletWithClips(walletId).then(() => {
      walletService.getWallet(walletId).then((initial) => {
        const clipsBefore = initial.body.currencyClips;

        const eurBefore = clipsBefore.find((c) => c.currency === 'EUR').balance;
        const usdBefore = clipsBefore.find((c) => c.currency === 'USD').balance;
        const gbpBefore = clipsBefore.find((c) => c.currency === 'GBP').balance;

        const data = { currency: 'JPY', amount: 10, type: 'debit' };

        walletService.createTransaction(walletId, data).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.outcome).to.eq('denied');

          walletService.getWallet(walletId).then((updated) => {
            const clipsAfter = updated.body.currencyClips;

            const jpyClip = clipsAfter.find((c) => c.currency === 'JPY');
            expect(jpyClip).to.not.exist;

            expect(clipsAfter.find((c) => c.currency === 'EUR').balance).to.equal(eurBefore);
            expect(clipsAfter.find((c) => c.currency === 'USD').balance).to.equal(usdBefore);
            expect(clipsAfter.find((c) => c.currency === 'GBP').balance).to.equal(gbpBefore);
          });
        });
      });
    });
  });
});
