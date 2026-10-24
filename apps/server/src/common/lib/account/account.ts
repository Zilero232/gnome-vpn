import { isPlaceholderEmail } from '@gnomevpn/schemas';

import type { AccountEmail } from './account.types';

export const hasConfirmedEmail = ({ email, emailVerified }: AccountEmail): boolean => emailVerified || isPlaceholderEmail(email);
