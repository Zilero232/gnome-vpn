import { describe, expect, it } from 'vitest';

import type { PanelInbound } from '../../../../../apps/server/src/lib/xray';

import { inboundMatches } from '../xray-panel.helpers';

const desired = {
  tag: 'hysteria-in',
  listen: null,
  port: 443,
  protocol: 'hysteria',
  settings: { version: 2, clients: [{ auth: 'fresh' }] },
  streamSettings: { network: 'hysteria', tlsSettings: { alpn: ['h3'], serverName: 'www.bing.com' } },
  sniffing: { enabled: true, destOverride: ['http', 'tls', 'quic'] }
};

const stored: PanelInbound = {
  id: 1,
  enable: true,
  remark: 'GnomeVPN Hysteria2',
  port: 443,
  protocol: 'hysteria',
  settings: JSON.stringify({ version: 2, clients: [{ email: 'live', auth: 'kept' }] }),
  streamSettings: JSON.stringify(desired.streamSettings, null, 2),
  sniffing: JSON.stringify(desired.sniffing)
};

describe('inboundMatches', () => {
  it('ignores the clients, which the panel keeps on its own', () => {
    expect(inboundMatches({ current: stored, desired })).toBe(true);
  });

  it('ignores a field the panel added that provisioning never sets', () => {
    const settings = JSON.stringify({ version: 2, clients: [], decryption: 'none' });

    expect(inboundMatches({ current: { ...stored, settings }, desired })).toBe(true);
  });

  it('sees a changed nested value', () => {
    const streamSettings = JSON.stringify({ ...desired.streamSettings, tlsSettings: { alpn: ['h3'], serverName: 'example.com' } });

    expect(inboundMatches({ current: { ...stored, streamSettings }, desired })).toBe(false);
  });

  it('compares a list whole, so a dropped entry is a change', () => {
    const sniffing = JSON.stringify({ enabled: true, destOverride: ['http', 'tls'] });

    expect(inboundMatches({ current: { ...stored, sniffing }, desired })).toBe(false);
  });

  it('sees a moved port', () => {
    expect(inboundMatches({ current: { ...stored, port: 8443 }, desired })).toBe(false);
  });

  it('treats unreadable stored settings as a change rather than a match', () => {
    expect(inboundMatches({ current: { ...stored, streamSettings: '{broken' }, desired })).toBe(false);
  });

  it('skips a part provisioning does not set, as a wireguard inbound has no stream settings', () => {
    const { streamSettings: _streamSettings, sniffing: _sniffing, ...bare } = desired;

    expect(inboundMatches({ current: { ...stored, streamSettings: '', sniffing: '' }, desired: bare })).toBe(true);
  });
});
