import { entries, isIncludedIn } from 'remeda';

import type { Locale } from '../locale';
import type { KeepsKeyInput } from './client-messages.types';

import { messages } from '../messages';
import { CLIENT_MESSAGES, SERVER_ONLY_KEYS } from './client-messages.constants';

export const keepsKey = ({ namespace, key }: KeepsKeyInput) => {
  const rule = CLIENT_MESSAGES[namespace];

  if (isIncludedIn(key, SERVER_ONLY_KEYS) || !rule) {
    return false;
  }

  return rule === 'all' || rule.includes(key);
};

export const clientMessages = (locale: Locale) =>
  Object.fromEntries(
    entries(messages[locale])
      .map(
        ([namespace, section]) => [namespace, Object.fromEntries(Object.entries(section).filter(([key]) => keepsKey({ namespace, key })))] as const
      )
      .filter(([, section]) => Object.keys(section).length > 0)
  );
