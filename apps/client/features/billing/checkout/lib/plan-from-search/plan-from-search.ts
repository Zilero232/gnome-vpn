import type { PlanId } from '@gnomevpn/schemas';

import { planIdSchema } from '@gnomevpn/schemas';

import { QUERY_PARAMS } from '@/shared/constants';

export const planFromSearch = (search: string): PlanId | null => {
  const parsed = planIdSchema.safeParse(new URLSearchParams(search).get(QUERY_PARAMS.plan));

  return parsed.success ? parsed.data : null;
};
