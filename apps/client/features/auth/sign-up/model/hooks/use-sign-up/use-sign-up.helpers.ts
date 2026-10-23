import { PERSONAL_DATA_CONSENT_VERSION } from '@gnomevpn/schemas';

import { recordPersonalDataConsent, updateMarketingConsent } from '@/shared/api';
import { clearPendingConsent, logger, storePendingConsent } from '@/shared/lib';

import type { RecordSignUpConsentsInput } from './use-sign-up.types';

export const recordSignUpConsents = async ({ userId, isMarketingConsentGiven }: RecordSignUpConsentsInput): Promise<void> => {
  storePendingConsent({ userId, version: PERSONAL_DATA_CONSENT_VERSION });

  const [personalData, marketing] = await Promise.allSettled([
    recordPersonalDataConsent({ version: PERSONAL_DATA_CONSENT_VERSION, source: 'signup' }),
    isMarketingConsentGiven ? updateMarketingConsent({ granted: true, source: 'signup' }) : Promise.resolve(null)
  ]);

  if (personalData.status === 'fulfilled') {
    clearPendingConsent();
  } else {
    logger.warn('personal data consent not recorded at sign-up', { error: personalData.reason });
  }

  if (marketing.status === 'rejected') {
    logger.warn('marketing consent not recorded at sign-up', { error: marketing.reason });
  }
};
