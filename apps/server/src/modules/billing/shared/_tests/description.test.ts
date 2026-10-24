import type { Plan } from '@gnomevpn/schemas';

import { describe, expect, it } from 'vitest';

import { describeExtraDevices, describeSubscription } from '../description.helpers';

const plan = (months: number): Plan => ({ id: 'monthly', months, priceRub: 100 });

describe('describeSubscription', () => {
  it('uses the singular month form for one month', () => {
    expect(describeSubscription({ kind: 'purchase', plan: plan(1) })).toBe('Подписка GnomeVPN на 1 месяц');
  });

  it('uses the few form for two months', () => {
    expect(describeSubscription({ kind: 'purchase', plan: plan(2) })).toBe('Подписка GnomeVPN на 2 месяца');
  });

  it('uses the few form for four months', () => {
    expect(describeSubscription({ kind: 'purchase', plan: plan(4) })).toBe('Подписка GnomeVPN на 4 месяца');
  });

  it('uses the many form for six months', () => {
    expect(describeSubscription({ kind: 'purchase', plan: plan(6) })).toBe('Подписка GnomeVPN на 6 месяцев');
  });

  it('uses the many form for twelve months', () => {
    expect(describeSubscription({ kind: 'purchase', plan: plan(12) })).toBe('Подписка GnomeVPN на 12 месяцев');
  });

  it('uses the many form for eleven months', () => {
    expect(describeSubscription({ kind: 'purchase', plan: plan(11) })).toBe('Подписка GnomeVPN на 11 месяцев');
  });

  it('uses the singular form for twenty one months', () => {
    expect(describeSubscription({ kind: 'purchase', plan: plan(21) })).toBe('Подписка GnomeVPN на 21 месяц');
  });

  it('renders the renewal prefix for the renewal kind', () => {
    expect(describeSubscription({ kind: 'renewal', plan: plan(6) })).toBe('Продление подписки GnomeVPN на 6 месяцев');
  });

  it('renders the gift prefix for the gift kind, so a statement never reads as a second subscription', () => {
    expect(describeSubscription({ kind: 'gift', plan: plan(6) })).toBe('Подарочная подписка GnomeVPN на 6 месяцев');
  });
});

describe('describeExtraDevices', () => {
  it('uses the singular form for one device', () => {
    expect(describeExtraDevices(1)).toBe('Дополнительные устройства GnomeVPN: 1 устройство');
  });

  it('uses the few form for two devices', () => {
    expect(describeExtraDevices(2)).toBe('Дополнительные устройства GnomeVPN: 2 устройства');
  });

  it('uses the many form for five devices', () => {
    expect(describeExtraDevices(5)).toBe('Дополнительные устройства GnomeVPN: 5 устройств');
  });

  it('uses the many form for zero devices', () => {
    expect(describeExtraDevices(0)).toBe('Дополнительные устройства GnomeVPN: 0 устройств');
  });

  it('uses the many form for eleven devices', () => {
    expect(describeExtraDevices(11)).toBe('Дополнительные устройства GnomeVPN: 11 устройств');
  });

  it('uses the singular form for twenty one devices', () => {
    expect(describeExtraDevices(21)).toBe('Дополнительные устройства GnomeVPN: 21 устройство');
  });

  it('uses the few form for twenty three devices', () => {
    expect(describeExtraDevices(23)).toBe('Дополнительные устройства GnomeVPN: 23 устройства');
  });
});
