import type { ApiErrorCode } from '@gnomevpn/schemas';

export const FINAL_REFUSALS: readonly ApiErrorCode[] = ['REFERRAL_CODE_INVALID', 'REFERRAL_SELF', 'REFERRAL_UNAVAILABLE', 'VALIDATION_FAILED'];
