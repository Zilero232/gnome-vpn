import { ACCOUNT_TAB, ROUTES } from '@/shared/constants';

import type { FaqQuestion } from './faq';

export const FAQ_LINKS: Partial<Record<FaqQuestion, string>> = {
  referral: `${ROUTES.account}#${ACCOUNT_TAB.invite}`
};
