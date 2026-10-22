import { apiErrorCode } from '@/shared/api';

import { FINAL_REFUSALS } from './final-refusal.constants';

export const isFinalRefusal = (error: unknown): boolean => FINAL_REFUSALS.includes(apiErrorCode(error));
