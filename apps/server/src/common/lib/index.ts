export { generateShortCode, timingSafeEqual } from './crypto';
export { describeError, errorCodeOf } from './errors';
export { canonicalIp, isIpAddress } from './ip-address';

export { paymentPlan } from './payment-plan';
export type { PaymentPlanInput } from './payment-plan';

export {
  accessExtension,
  activeDeviceLimit,
  extendPeriod,
  extraDevicesGrant,
  hasLapsedBeyondGrace,
  isPeriodActive,
  PERIOD_GRACE,
  resolveStatus,
  rewindPeriod,
  SUBSCRIPTION_PERIOD_SELECT
} from './period';
export type { SubscriptionPeriod } from './period';

export { countryFlag, fillTokens, pluralize } from './text';
export type { FillTokensInput, PluralForms, TokenFill } from './text';

export { addUtcDays, dayKey, dayKeys, utcDay, windowStart } from './utc-day';
export type { AddUtcDaysInput, DayWindowInput, WindowStartInput } from './utc-day';
