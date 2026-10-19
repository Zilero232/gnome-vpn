import { x25519 } from '@noble/curves/ed25519.js';

import type { WireguardKeyPair } from './wireguard-keys.types';

export const wireguardPublicKey = (privateKey: string): string =>
  Buffer.from(x25519.getPublicKey(Buffer.from(privateKey, 'base64'))).toString('base64');

export const generateWireguardKeys = (): WireguardKeyPair => {
  const privateKey = Buffer.from(x25519.utils.randomSecretKey()).toString('base64');

  return { privateKey, publicKey: wireguardPublicKey(privateKey) };
};
