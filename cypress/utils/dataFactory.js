const currencyCodes = require('currency-codes');

function generateTransaction(overrides = {}) {
  const allCurrencies = currencyCodes.codes(); // returns ["USD", "EUR", "GBP", ...]
  const currency = allCurrencies[Math.floor(Math.random() * allCurrencies.length)];

  return {
    currency,
    amount: Number((Math.random() * 100 + 1).toFixed(2)),
    type: 'credit',
    ...overrides,
  };
}

module.exports = { generateTransaction };
