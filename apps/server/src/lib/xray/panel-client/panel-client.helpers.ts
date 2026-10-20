import { isNullish } from 'remeda';

import type { PanelLastOnline, PanelOnlines } from './panel-client.types';

export const collectOnlineEmails = (payload: PanelOnlines): Set<string> | null => {
  if (isNullish(payload)) {
    return null;
  }

  if (Array.isArray(payload)) {
    return new Set(payload);
  }

  return new Set(Object.values(payload).flat());
};

export const collectLastOnline = (payload: PanelLastOnline): Map<string, Date> =>
  new Map(
    Object.entries(payload ?? {})
      .filter(([, at]) => at > 0)
      .map(([email, at]) => [email, new Date(at)])
  );
