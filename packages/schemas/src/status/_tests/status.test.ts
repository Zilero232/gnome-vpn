import { describe, expect, it } from 'vitest';

import { connectionCheckSchema } from '../status.schemas';

describe('connectionCheckSchema', () => {
  it('accepts an address of either family', () => {
    expect(connectionCheckSchema.safeParse({ ip: '203.0.113.10' }).success).toBe(true);
    expect(connectionCheckSchema.safeParse({ ip: '2001:db8::10' }).success).toBe(true);
  });

  it('refuses a hostname, so the check never resolves a name the caller chose', () => {
    expect(connectionCheckSchema.safeParse({ ip: 'gnome-vpn.com' }).success).toBe(false);
  });

  it('refuses a range, which would turn the check into a scan', () => {
    expect(connectionCheckSchema.safeParse({ ip: '203.0.113.0/24' }).success).toBe(false);
  });
});
