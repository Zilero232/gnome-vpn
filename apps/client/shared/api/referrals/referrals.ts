import type { ClaimReferralInput, ReferralOverview } from '@gnomevpn/schemas';

import { api } from '../http';

export const getReferrals = async (): Promise<ReferralOverview> => {
  const { data } = await api.get('/referrals');

  return data;
};

export const claimReferral = async (input: ClaimReferralInput): Promise<ReferralOverview> => {
  const { data } = await api.post('/referrals/claim', input);

  return data;
};
