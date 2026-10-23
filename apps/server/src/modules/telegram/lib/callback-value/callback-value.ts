import { isNullish } from 'remeda';
import { z } from 'zod';

import type { AutoRenewChoice } from '../../telegram.types';
import type { CountFromInput, DeviceAnswer, WireguardChoice } from './callback-value.types';

import { AUTO_RENEW_CHOICE, CONFIRMED, DECLINED, OFFERS_CHOICE, SUBJECT_SEPARATOR, WIREGUARD_KINDS } from '../../config';
import { DIGITS, SUBJECT_PARTS } from './callback-value.constants';

export const isConfirmed = (raw: string): boolean => raw === CONFIRMED;

export const countFrom = ({ raw, max }: CountFromInput): number | null => {
  if (!DIGITS.test(raw)) {
    return null;
  }

  const parsed = Number(raw);

  return parsed > 0 && parsed <= max ? parsed : null;
};

export const autoRenewChoice = (raw: string): AutoRenewChoice | null => (raw === AUTO_RENEW_CHOICE.on || raw === AUTO_RENEW_CHOICE.off ? raw : null);

export const offersChoice = (raw: string): boolean | null => {
  if (raw === OFFERS_CHOICE.on) {
    return true;
  }

  return raw === OFFERS_CHOICE.off ? false : null;
};

export const parseUuid = (raw: string): string | null => (z.uuid().safeParse(raw).success ? raw : null);

export const deviceAnswer = (raw: string): DeviceAnswer | null => {
  const parts = raw.split(SUBJECT_SEPARATOR);

  if (parts.length !== SUBJECT_PARTS) {
    return null;
  }

  const [answer, subject] = parts;
  const deviceId = parseUuid(subject);

  if (isNullish(deviceId) || (answer !== CONFIRMED && answer !== DECLINED)) {
    return null;
  }

  return { isConfirmed: answer === CONFIRMED, deviceId };
};

export const wireguardChoice = (raw: string): WireguardChoice | null => {
  const parts = raw.split(SUBJECT_SEPARATOR);

  if (parts.length !== SUBJECT_PARTS) {
    return null;
  }

  const [subject, picked] = parts;
  const nodeId = parseUuid(subject);
  const kind = WIREGUARD_KINDS.find((entry) => entry.kind === picked);

  if (isNullish(nodeId) || isNullish(kind)) {
    return null;
  }

  return { nodeId, kind };
};
