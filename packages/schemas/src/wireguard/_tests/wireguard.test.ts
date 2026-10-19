import { describe, expect, it } from 'vitest';

import { createWireguardConfigSchema } from '../wireguard.schemas';

const NODE = '5b0f6f5e-6d5e-4c55-9f2e-2a7a8f6c1d10';

describe('createWireguardConfigSchema', () => {
  it('trims the name a person typed', () => {
    expect(createWireguardConfigSchema.parse({ nodeId: NODE, name: '  Ноутбук  ' })).toEqual({ nodeId: NODE, name: 'Ноутбук' });
  });

  it('refuses an empty or a too long name', () => {
    expect(createWireguardConfigSchema.safeParse({ nodeId: NODE, name: '   ' }).success).toBe(false);
    expect(createWireguardConfigSchema.safeParse({ nodeId: NODE, name: 'x'.repeat(25) }).success).toBe(false);
  });

  it('refuses a node id that is not a uuid, so it never reaches a query', () => {
    expect(createWireguardConfigSchema.safeParse({ nodeId: 'nl-1', name: 'Laptop' }).success).toBe(false);
  });
});
