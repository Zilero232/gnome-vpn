import type { ReferralOverview } from '@gnomevpn/schemas';

import { api } from '../http';

export const getReferrals = async (): Promise<ReferralOverview> => {
  const { data } = await api.get('/referrals');

  return data;
};
