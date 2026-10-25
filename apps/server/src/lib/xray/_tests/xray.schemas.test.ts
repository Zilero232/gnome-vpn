import { describe, expect, it } from 'vitest';

import { PANEL_SCHEMA } from '../xray.schemas';

const inbound = {
  id: 2,
  enable: true,
  remark: 'GnomeVPN WireGuard',
  port: 51820,
  protocol: 'wireguard',
  settings: { peers: [] }
};

describe('PANEL_SCHEMA.inbound', () => {
  it('accepts the null streamSettings and sniffing a WireGuard inbound carries', () => {
    expect(PANEL_SCHEMA.inbound.safeParse({ ...inbound, streamSettings: null, sniffing: null }).success).toBe(true);
  });

  it('accepts an inbound without the optional settings', () => {
    expect(PANEL_SCHEMA.inbound.safeParse({ ...inbound, settings: undefined }).success).toBe(true);
  });

  it('rejects an inbound without a remark', () => {
    expect(PANEL_SCHEMA.inbound.safeParse({ ...inbound, remark: undefined }).success).toBe(false);
  });
});
