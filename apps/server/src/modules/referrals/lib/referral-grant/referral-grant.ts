import type { GrantedDaysInput } from './referral-grant.types';

export const grantedDays = ({ planned, earned, cap }: GrantedDaysInput): number => Math.max(0, Math.min(planned, cap - earned));
