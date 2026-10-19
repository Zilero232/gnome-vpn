export { describeError } from './describe-error';
export { errorCodeOf } from './error-code';
export { IDENTIFIED_NODE_SELECT, NODE_ACCESS_SELECT, xrayClientForNode } from './node-credentials';
export type { IdentifiedNode, NodeAccess } from './node-credentials';

export { activeDeviceLimit, extendPeriod, isPeriodActive, nextPeriodEnd, resolveStatus } from './period';
export type { ExtendPeriodInput, PeriodInput } from './period';

export { pluralize } from './pluralize';
export type { PluralForms } from './pluralize';

export { timingSafeEqual } from './timing-safe-equal';
