import type { ConsentState } from '@gnomevpn/schemas';

import { firstBy } from 'remeda';

import type { ConsentRow } from './consent-state.types';

export const consentState = (rows: ConsentRow[]): ConsentState => {
  const [personalData, marketing] = (['personalData', 'marketing'] as const).map((kind) =>
    firstBy(
      rows.filter((row) => row.kind === kind),
      [(row) => row.createdAt.getTime(), 'desc']
    )
  );

  return {
    personalData: personalData ? { granted: personalData.granted, version: personalData.version, at: personalData.createdAt.toISOString() } : null,
    marketing: marketing ? { granted: marketing.granted, at: marketing.createdAt.toISOString() } : null
  };
};
