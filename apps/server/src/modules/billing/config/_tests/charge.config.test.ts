import { describe, expect, it } from 'vitest';

import { REFUND } from '../charge.config';

describe('the automatic refund idempotence key, byte for byte', () => {
  it('stays refund-<payment row id>, so the sweep retrying a payment asks YooKassa for the same refund', () => {
    expect(`${REFUND.idempotencePrefix}0b5c2f7e-1d1a-4c39-9a51-7d0e0c1e2f3a`).toBe('refund-0b5c2f7e-1d1a-4c39-9a51-7d0e0c1e2f3a');
  });
});
