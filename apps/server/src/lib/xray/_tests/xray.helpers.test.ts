import { describe, expect, it } from 'vitest';

import type { PanelInbound } from '../xray.types';

import { AUTH_BYTES } from '../xray.constants';
import { addressOf, generateAuth, hostOf, hostRoute, readClients, readSettings } from '../xray.helpers';
import { PANEL_SCHEMA } from '../xray.schemas';

const inbound = (patch: Partial<PanelInbound>): PanelInbound => ({
  id: 1,
  enable: true,
  remark: 'test',
  port: 443,
  protocol: 'hysteria',
  settings: '{}',
  ...patch
});

const settingsOf = (patch: Partial<PanelInbound>) => readSettings({ inbound: inbound(patch), schema: PANEL_SCHEMA.settings });

describe('generateAuth', () => {
  it('returns a lowercase hex string', () => {
    expect(generateAuth()).toMatch(/^[\da-f]+$/);
  });

  it('returns two hex characters per configured byte', () => {
    expect(generateAuth()).toHaveLength(AUTH_BYTES * 2);
  });

  it('returns a different value on every call', () => {
    expect(generateAuth()).not.toBe(generateAuth());
  });
});

describe('readClients', () => {
  it('reads the client list out of a settings string', () => {
    expect(readClients(inbound({ settings: '{"clients":[{"email":"a"},{"email":"b"}]}' }))).toEqual([{ email: 'a' }, { email: 'b' }]);
  });

  it('reads the client list out of an already parsed object', () => {
    const clients = [{ email: 'a' }];

    expect(readClients(inbound({ settings: { clients } }))).toEqual(clients);
  });

  it('reports an empty node as empty, not as unreadable', () => {
    expect(readClients(inbound({ settings: '{"clients":[]}' }))).toEqual([]);
  });

  it('treats settings with no clients key as read, holding nothing', () => {
    expect(readClients(inbound({ settings: '{"secretKey":"key"}' }))).toEqual([]);
  });

  it('refuses to guess at malformed settings rather than answering an empty list', () => {
    expect(readClients(inbound({ settings: '{not json' }))).toBeNull();
  });

  it('refuses to guess when settings are absent altogether', () => {
    expect(readClients(inbound({ settings: undefined }))).toBeNull();
  });

  it('refuses an already parsed object that carries no client list', () => {
    expect(readClients(inbound({ settings: { secretKey: 'key' } }))).toBeNull();
  });
});

describe('readSettings', () => {
  it('parses a settings string', () => {
    expect(settingsOf({ settings: '{"secretKey":"key","mtu":1360}' })).toEqual({ mtu: 1360, secretKey: 'key' });
  });

  it('passes an already parsed object through', () => {
    const settings = { secretKey: 'key' };

    expect(settingsOf({ settings })).toEqual(settings);
  });

  it('refuses to guess at malformed settings rather than answering an empty object', () => {
    expect(settingsOf({ settings: '{"clients":' })).toBeNull();
  });

  it('refuses to guess when settings are absent', () => {
    expect(settingsOf({ settings: undefined })).toBeNull();
  });

  it('reports genuinely empty settings as empty rather than unreadable', () => {
    expect(settingsOf({ settings: '{}' })).toEqual({});
  });
});

describe('hostOf', () => {
  it('drops the mask the panel stores with an address', () => {
    expect(hostOf('10.9.0.7/32')).toBe('10.9.0.7');
  });

  it('leaves a bare address as it is', () => {
    expect(hostOf('10.9.0.7')).toBe('10.9.0.7');
  });
});

describe('hostRoute', () => {
  it('always sends a single-host route, since a wider one would capture other clients', () => {
    expect(hostRoute('10.9.0.7')).toBe('10.9.0.7/32');
    expect(hostRoute('10.9.0.7/24')).toBe('10.9.0.7/32');
  });
});

describe('addressOf', () => {
  it('reads the first allowed address of a client', () => {
    expect(addressOf({ email: 'a', allowedIPs: ['10.9.0.7/32', 'fd00::7/128'] })).toBe('10.9.0.7');
  });

  it('answers null for a client the panel has not addressed', () => {
    expect(addressOf({ email: 'a' })).toBeNull();
    expect(addressOf(undefined)).toBeNull();
  });
});
