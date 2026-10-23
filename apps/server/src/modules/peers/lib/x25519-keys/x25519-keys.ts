import { x25519 } from '@noble/curves/ed25519.js';
import { randomBytes } from 'node:crypto';

import type { PublicKeyInput, X25519KeyPair } from './x25519-keys.types';

import { REALITY } from '../../config';

const publicKeyOf = ({ privateKey, encoding }: PublicKeyInput): string =>
  Buffer.from(x25519.getPublicKey(Buffer.from(privateKey, encoding))).toString(encoding);

const keyPair = (encoding: BufferEncoding): X25519KeyPair => {
  const privateKey = Buffer.from(x25519.utils.randomSecretKey()).toString(encoding);

  return { privateKey, publicKey: publicKeyOf({ privateKey, encoding }) };
};

export const generateRealityKeys = (): X25519KeyPair => keyPair('base64url');

export const generateRealityShortId = (): string => randomBytes(REALITY.shortIdBytes).toString('hex');

export const generateWireguardKeys = (): X25519KeyPair => keyPair('base64');

export const wireguardPublicKey = (privateKey: string): string => publicKeyOf({ privateKey, encoding: 'base64' });
