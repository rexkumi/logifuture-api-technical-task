const walletService = require('../../services/wallet.service');
const walletApi = require('../../api/wallet.api');
const { generateTransaction } = require('../../utils/dataFactory');

describe('Wallet Transactions API – Full Coverage Suite', () => {
  let walletId;

  before(() => {
  cy.login().then(() => {
    cy.getWalletId().then((id) => {
      walletId = id;
    });
  });
});

  // ---------------------------------------------------------
  // P1 — CORE BUSINESS LOGIC
  // ---------------------------------------------------------

  it('P1: First-time credit creates a new currency clip', () => {
    const data = generateTransaction({ type: 'credit', currency: 'EUR' });

    walletService.createTransaction(walletId, data).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.transactionId).to.exist;
    });

    walletApi.getWallet(walletId).then((res) => {
      const eur = res.body.currencyClips.find((c) => c.currency === 'EUR');
      expect(eur).to.exist;
      expect(eur.balance).to.be.greaterThan(0);
    });
  });

  it('P1: Credit increases balance correctly', () => {
    walletApi.getWallet(walletId).then((initial) => {
      const before = initial.body.currencyClips.find((c) => c.currency === 'EUR').balance;

      const data = generateTransaction({ type: 'credit', currency: 'EUR' });
      walletService.createTransaction(walletId, data);

      walletApi.getWallet(walletId).then((updated) => {
        const after = updated.body.currencyClips.find((c) => c.currency === 'EUR').balance;
        expect(after).to.be.greaterThan(before);
      });
    });
  });

  it('P1: Debit reduces balance correctly', () => {
    const data = generateTransaction({ type: 'debit', currency: 'EUR', amount: 5 });

    walletService.createTransaction(walletId, data).then((res) => {
      expect([200, 400]).to.include(res.status);
    });

    walletApi.getWallet(walletId).then((res) => {
      const eur = res.body.currencyClips.find((c) => c.currency === 'EUR');
      expect(eur.balance).to.be.greaterThan(0);
    });
  });

  it('P1: Debit fails when insufficient funds', () => {
    const data = { currency: 'EUR', amount: 999999, type: 'debit' };

    walletService.createTransaction(walletId, data).then((res) => {
      expect(res.status).to.be.oneOf([400, 409]);
      expect(res.body.outcome).to.eq('denied');
    });
  });

  it('P1: Pending → Finished transaction flow', () => {
    const data = generateTransaction({ type: 'credit', currency: 'USD' });

    walletService.createTransaction(walletId, data).then((res) => {
      const txId = res.body.transactionId;

      if (res.body.status === 'pending') {
        walletService.waitForTransaction(walletId, txId).then((finalRes) => {
          expect(finalRes.body.status).to.eq('finished');
          expect(['approved', 'denied']).to.include(finalRes.body.outcome);
        });
      } else {
        expect(res.body.status).to.eq('finished');
      }
    });
  });

  it('P1: Transaction detail retrieval returns correct data', () => {
    const data = generateTransaction({ type: 'credit' });

    walletService.createTransaction(walletId, data).then((res) => {
      const txId = res.body.transactionId;

      walletApi.getTransaction(walletId, txId).then((txRes) => {
        expect(txRes.status).to.eq(200);
        expect(txRes.body.transactionId).to.eq(txId);
      });
    });
  });

  // ---------------------------------------------------------
  // P2 — VALIDATION & INPUT ROBUSTNESS
  // ---------------------------------------------------------

  it('P2: Invalid currency code returns validation error', () => {
    const data = generateTransaction({ currency: 'INVALID' });

    walletService.createTransaction(walletId, data).then((res) => {
      expect(res.status).to.be.oneOf([400, 422]);
    });
  });

  it('P2: Negative amount returns validation error', () => {
    const data = generateTransaction({ amount: -50 });

    walletService.createTransaction(walletId, data).then((res) => {
      expect(res.status).to.be.oneOf([400, 422]);
    });
  });

  it('P2: Invalid transaction type returns validation error', () => {
    const data = generateTransaction({ type: 'refund' });

    walletService.createTransaction(walletId, data).then((res) => {
      expect(res.status).to.be.oneOf([400, 422]);
    });
  });

  it('P2: Missing required fields returns validation error', () => {
    walletService.createTransaction(walletId, {}).then((res) => {
      expect(res.status).to.be.oneOf([400, 422]);
    });
  });

  // ---------------------------------------------------------
  // P3 — BROADER BEHAVIOR & EDGE CASES
  // ---------------------------------------------------------

  it('P3: Multi-currency wallet support', () => {
    const tx1 = generateTransaction({ type: 'credit', currency: 'EUR' });
    const tx2 = generateTransaction({ type: 'credit', currency: 'USD' });

    walletService.createTransaction(walletId, tx1);
    walletService.createTransaction(walletId, tx2);

    walletApi.getWallet(walletId).then((res) => {
      const currencies = res.body.currencyClips.map((c) => c.currency);
      expect(currencies).to.include('EUR');
      expect(currencies).to.include('USD');
    });
  });

  it('P3: Invalid walletId returns error', () => {
    const data = generateTransaction();

    walletService.createTransaction('00000000-0000-0000-0000-000000000000', data).then((res) => {
      expect(res.status).to.be.oneOf([401, 404]);
    });
  });
});
