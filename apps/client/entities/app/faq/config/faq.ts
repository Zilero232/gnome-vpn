import { planMonthlyRub, PLANS } from '@gnomevpn/schemas';

export const FAQ_GROUPS = [
  { key: 'start', questions: ['whatIsIncy', 'whyNotOwnApp', 'otherApps', 'wireguard', 'howToConnect', 'whichProtocol', 'howManyDevices'] },
  { key: 'usage', questions: ['whichCountries', 'speed', 'torrents', 'streaming'] },
  { key: 'trouble', questions: ['notConnecting', 'slowSpeed', 'linkLeaked', 'changePhone'] },
  { key: 'billing', questions: ['price', 'howToPay', 'refund', 'autoRenew', 'trial', 'referral'] }
] as const;

export const FAQ_HIGHLIGHTS = ['whatIsIncy', 'trial', 'whyNotOwnApp', 'howManyDevices', 'whichCountries', 'refund'] as const;

export const FAQ_QUESTIONS = FAQ_GROUPS.flatMap((group) => group.questions);

export const FAQ_ANSWER_VALUES = Object.fromEntries(
  PLANS.flatMap((plan) => [
    [plan.id, plan.priceRub],
    [`${plan.id}PerMonth`, planMonthlyRub(plan.id)]
  ])
);

export type FaqGroup = (typeof FAQ_GROUPS)[number]['key'];
