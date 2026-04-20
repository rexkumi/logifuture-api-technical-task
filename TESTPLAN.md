# Test Plan – Logifuture Wallet Transactions API

This document outlines the implemented and unimplemented test cases for the Wallet Transactions API.  
The suite validates core wallet behavior, multi‑currency logic, validation rules, and error handling.

------------------------------------------------------------
## Implemented Test Cases (6)

### P1 — High Priority (Core Business Logic)

1. **Creates a new currency clip on first credit**  
   Validates that the first credit in a previously unused currency automatically creates a new currency clip with the correct initial balance and metadata.

2. **Accurately increases credited currency balance and leaves uncredited currencies unchanged**  
   Ensures that crediting EUR increases only the EUR balance, while all other seeded currencies (e.g., USD, GBP) remain unchanged. Confirms correct multi‑currency isolation.

3. **Returns denied outcome when the debited amount exceeds the available balance**  
   Attempts to withdraw more than the available balance.  
   Expects:  
   - outcome = denied  
   - no balance changes  
   - no new clips created  

### P2 — Medium Priority (Validation & Input Rules)

4. **Returns 400 when the transaction payload is invalid**  
   Sends malformed or invalid transaction data (invalid currency, negative amount, invalid type).  
   Expects:  
   - HTTP 400  
   - descriptive validation error  

5. **Returns 400 when attempting multiple credits in a single request**  
   Sends an array of credit operations in one payload.  
   Expects:  
   - HTTP 400  
   - backend rejects multi‑operation requests  

### P3 — Lower Priority (Edge‑Case Business Rules)

6. **Returns denied outcome when attempting to withdraw from a currency the user’s wallet does not hold**  
   Attempts to debit a currency clip that does not exist (e.g., JPY when wallet only has EUR/USD/GBP).  
   Expects:  
   - outcome = denied  
   - no new clip created  
   - all existing balances unchanged  

------------------------------------------------------------
## Crucial Unimplemented Test Cases (5)

### P1 — High Priority

1. **Pending → finished transaction flow**  
   The framework supports polling via waitForTransaction(), but the backend does not expose a deterministic way to force a pending transaction.  
   This test would validate the full lifecycle from pending → finished.

2. **Initial wallet state validation**  
   A test confirming the wallet starts empty (no clips) before any transactions.  
   Not implemented because the suite always seeds or resets the wallet before tests, and the initial state may vary per environment.

### P2 — Medium Priority

3. **Idempotency test (same transaction submitted twice)**  
   Requires backend support for custom transaction IDs or replay detection.

### P3 — Lower Priority

4. **High‑volume transaction sequence (50+ operations)**  
   Moves into performance/load testing, outside the scope of this task.

5. **Retrieving all transactions for a specific wallet between specific dates**  
   Not implemented because it would require **large‑scale data seeding** to generate a meaningful transaction history

------------------------------------------------------------
## Summary

This test plan provides:

- 6 implemented tests covering the core wallet behaviors required by the task  
- 5 unimplemented but high‑value tests demonstrating deeper system understanding  
- Clear prioritization based on business impact and technical feasibility  

The suite meets all requirements of the Logifuture API Technical Task.
