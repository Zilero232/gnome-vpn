import type {
  ConsentState,
  RecordPersonalDataConsentInput,
  UnsubscribeQuery,
  UnsubscribeResult,
  UpdateMarketingConsentInput
} from '@gnomevpn/schemas';

import { api } from '../http';

export const getConsents = async (): Promise<ConsentState> => {
  const { data } = await api.get('/consents');

  return data;
};

export const updateMarketingConsent = async (input: UpdateMarketingConsentInput): Promise<ConsentState> => {
  const { data } = await api.put('/consents/marketing', input);

  return data;
};

export const recordPersonalDataConsent = async (input: RecordPersonalDataConsentInput): Promise<ConsentState> => {
  const { data } = await api.post('/consents/personal-data', input);

  return data;
};

export const unsubscribe = async (params: UnsubscribeQuery): Promise<UnsubscribeResult> => {
  const { data } = await api.get('/consents/unsubscribe', { params });

  return data;
};
