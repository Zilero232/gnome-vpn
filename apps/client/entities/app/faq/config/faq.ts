import { DEFAULT_DEVICE_LIMIT, EXTRA_DEVICE_PRICE_RUB, MAX_EXTRA_DEVICES, planMonthlyRub, PLANS } from '@gnomevpn/schemas';

export const FAQ_GROUPS = [
  { key: 'start', questions: ['whatIsIncy', 'whyNotOwnApp', 'otherApps', 'wireguard', 'howToConnect', 'whichProtocol', 'howManyDevices', 'family'] },
  { key: 'usage', questions: ['whichCountries', 'speed', 'torrents', 'streaming', 'russianSites'] },
  { key: 'trouble', questions: ['notConnecting', 'slowSpeed', 'linkLeaked', 'changePhone'] },
  { key: 'billing', questions: ['price', 'howToPay', 'refund', 'autoRenew', 'trial', 'referral', 'promoCodes'] }
] as const;

export const FAQ_HIGHLIGHTS = ['whatIsIncy', 'trial', 'whyNotOwnApp', 'howManyDevices', 'whichCountries', 'russianSites', 'refund'] as const;

export const FAQ_QUESTIONS = FAQ_GROUPS.flatMap((group) => group.questions);

export const FAQ_ANSWER_VALUES = {
  ...Object.fromEntries(
    PLANS.flatMap((plan) => [
      [plan.id, plan.priceRub],
      [`${plan.id}PerMonth`, planMonthlyRub(plan.id)]
    ])
  ),
  devices: DEFAULT_DEVICE_LIMIT,
  extraDevices: MAX_EXTRA_DEVICES,
  extraDevicePrice: EXTRA_DEVICE_PRICE_RUB
};

export type FaqGroup = (typeof FAQ_GROUPS)[number]['key'];
