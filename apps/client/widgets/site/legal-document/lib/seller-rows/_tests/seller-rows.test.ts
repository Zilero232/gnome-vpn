import { describe, expect, it } from 'vitest';

import type { Seller } from '../seller-rows.types';

import { sellerRows } from '../seller-rows';

const EMPTY: Seller = { name: undefined, status: undefined, inn: undefined, ogrnip: undefined, address: undefined };

describe('sellerRows', () => {
  it('lists nothing when no requisite is set', () => {
    expect(sellerRows(EMPTY)).toEqual([]);
  });

  it('describes an individual entrepreneur with every field, in the order the page shows them', () => {
    const seller: Seller = {
      name: 'Иванов Иван Иванович',
      status: 'entrepreneur',
      inn: '123456789012',
      ogrnip: '123456789012345',
      address: 'Москва'
    };

    expect(sellerRows(seller).map(({ field }) => field)).toEqual(['name', 'status', 'inn', 'ogrnip', 'address']);
  });

  it('leaves out what a self-employed seller does not have, rather than printing an empty row', () => {
    const seller: Seller = { ...EMPTY, name: 'Иванов Иван Иванович', status: 'selfEmployed', inn: '123456789012' };

    expect(sellerRows(seller)).toEqual([
      { field: 'name', value: 'Иванов Иван Иванович' },
      { field: 'status', value: 'selfEmployed' },
      { field: 'inn', value: '123456789012' }
    ]);
  });
});
