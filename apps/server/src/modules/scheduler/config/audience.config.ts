import { PLACEHOLDER_EMAIL } from '@gnomevpn/schemas';

import type { Prisma } from '../../../../generated';

export const REACHABLE_USER: Prisma.UserWhereInput = {
  OR: [{ telegramAccount: { is: { blockedAt: null } } }, { emailVerified: true, NOT: { email: { endsWith: PLACEHOLDER_EMAIL.domain } } }]
};
