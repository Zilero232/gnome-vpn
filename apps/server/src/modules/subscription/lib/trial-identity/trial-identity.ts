import { isPlaceholderEmail } from '@gnomevpn/schemas';
import { createHash } from 'node:crypto';
import { isNonNullish } from 'remeda';

import type { TrialIdentitiesInput } from './trial-identity.types';

import { TRIAL_IDENTITY } from '../../config';

const GMAIL_ALIASES: readonly string[] = TRIAL_IDENTITY.gmailAliases;

export const normaliseEmail = (email: string): string => {
  const lowered = email.trim().toLowerCase();
  const at = lowered.lastIndexOf('@');
  const local = lowered.slice(0, at).replace(/\+.*$/, '');
  const domain = lowered.slice(at + 1);

  if (GMAIL_ALIASES.includes(domain)) {
    return `${local.replaceAll('.', '')}@${TRIAL_IDENTITY.gmailDomain}`;
  }

  return `${local}@${domain}`;
};

const hashIdentity = (identity: string): string => createHash('sha256').update(identity).digest('hex');

export const trialIdentities = ({ email, telegramId }: TrialIdentitiesInput): string[] => {
  const identities = [
    email && !isPlaceholderEmail(email) ? `${TRIAL_IDENTITY.emailPrefix}${normaliseEmail(email)}` : null,
    isNonNullish(telegramId) ? `${TRIAL_IDENTITY.telegramPrefix}${telegramId}` : null
  ];

  return identities.filter(isNonNullish).map(hashIdentity);
};
