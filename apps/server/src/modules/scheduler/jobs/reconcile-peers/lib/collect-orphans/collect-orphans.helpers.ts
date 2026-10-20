import { isNonNullish } from 'remeda';

import { ownerIdOf } from '../orphan-owner';

export const isServerOwned = (email: string): boolean => isNonNullish(ownerIdOf(email));
