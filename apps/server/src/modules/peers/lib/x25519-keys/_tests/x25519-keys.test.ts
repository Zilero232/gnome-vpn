import { x25519 } from '@noble/curves/ed25519.js';
import { describe, expect, it } from 'vitest';

import { REALITY } from '@/modules/peers/config';

import { generateRealityKeys, generateRealityShortId, generateWireguardKeys, wireguardPublicKey } from '../x25519-keys';

const KEY = /^[A-Za-z0-9+/]{43}=$/u;

describe('generateRealityKeys', () => {
  it('derives the public half from the private one, which is what the client verifies against', () => {
    const { privateKey, publicKey } = generateRealityKeys();

    const derived = Buffer.from(x25519.getPublicKey(Buffer.from(privateKey, 'base64url'))).toString('base64url');

    expect(derived).toBe(publicKey);
  });

  it('encodes both halves url-safe, since the public key travels in a query parameter', () => {
    const { privateKey, publicKey } = generateRealityKeys();

    expect(encodeURIComponent(publicKey)).toBe(publicKey);
    expect(encodeURIComponent(privateKey)).toBe(privateKey);
  });

  it('never repeats a key pair', () => {
    const keys = Array.from({ length: 50 }, generateRealityKeys);

    expect(new Set(keys.map((key) => key.privateKey)).size).toBe(keys.length);
  });
});

describe('generateRealityShortId', () => {
  it('is hex of the configured length, which is what xray accepts', () => {
    expect(generateRealityShortId()).toMatch(new RegExp(`^[0-9a-f]{${REALITY.shortIdBytes * 2}}$`));
  });

  it('never repeats', () => {
    const ids = Array.from({ length: 100 }, generateRealityShortId);

    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('generateWireguardKeys', () => {
  it('writes both keys the way wg and the panel expect them: 32 bytes of standard base64', () => {
    const { privateKey, publicKey } = generateWireguardKeys();

    expect(privateKey).toMatch(KEY);
    expect(publicKey).toMatch(KEY);
    expect(Buffer.from(privateKey, 'base64')).toHaveLength(32);
  });

  it('pairs the public key with the private one', () => {
    const { privateKey, publicKey } = generateWireguardKeys();

    expect(wireguardPublicKey(privateKey)).toBe(publicKey);
  });

  it('never hands two devices the same key', () => {
    const keys = new Set(Array.from({ length: 50 }, () => generateWireguardKeys().privateKey));

    expect(keys.size).toBe(50);
  });
});

describe('wireguardPublicKey', () => {
  it('matches the RFC 7748 test vector', () => {
    const alice = Buffer.from('77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a', 'hex').toString('base64');
    const expected = Buffer.from('8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a', 'hex').toString('base64');

    expect(wireguardPublicKey(alice)).toBe(expected);
  });
});
