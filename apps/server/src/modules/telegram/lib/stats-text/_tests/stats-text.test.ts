import { PLANS } from '@gnomevpn/schemas';
import { addMinutes, subMinutes } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { BOT_TEXT, OWNER_ALERT } from '@/modules/telegram/config';
import { dayCount } from '@/modules/telegram/lib/day-count';
import { nodeLabel } from '@/modules/telegram/lib/node-label';

import type { BotStats, StatsNode } from '../stats-text.types';

import { statsText } from '../stats-text';

const NOW = new Date('2026-10-23T12:00:00.000Z');

const [first, second] = PLANS;

const subscriptions: BotStats['subscriptions'] = {
  paid: [
    { plan: first.id, count: 2 },
    { plan: second.id, count: 1 }
  ],
  trials: 1,
  autoRenew: 2
};

const node = (patch: Partial<StatsNode>): StatsNode => ({
  country: 'Germany',
  countryCode: 'DE',
  city: 'Frankfurt',
  isAvailable: true,
  healthyAt: NOW,
  ...patch
});

const stats = (patch: Partial<BotStats> = {}): BotStats => ({
  users: { total: 1234, day: 56, week: 789 },
  subscriptions,
  payments: { days: 30, count: 17, amount: 4321 },
  devices: 321,
  chats: 99,
  nodes: [node({})],
  ...patch
});

describe('statsText', () => {
  it('reports every figure it was given', () => {
    const text = statsText({ stats: stats(), locale: 'ru', now: NOW });

    for (const figure of [1234, 56, 789, 17, 321, 99]) {
      expect(text).toContain(String(figure));
    }
  });

  it('names the window the payments were counted over', () => {
    const days = 7;
    const text = statsText({ stats: stats({ payments: { days, count: 1, amount: 200 } }), locale: 'en', now: NOW });

    expect(text).toContain(dayCount({ days, locale: 'en' }));
  });

  it('marks each node by how it answers', () => {
    const silent = subMinutes(NOW, OWNER_ALERT.nodeDownAfterMinutes);
    const up = node({});
    const quiet = node({ countryCode: 'NL', country: 'Netherlands', healthyAt: silent });
    const off = node({ countryCode: 'FI', isAvailable: false });
    const nodes = [up, quiet, off];
    const lines = statsText({ stats: stats({ nodes }), locale: 'en', now: NOW }).split('\n');
    const lineOf = (each: StatsNode) => lines.find((line) => line.includes(nodeLabel({ node: each, locale: 'en' })));

    const [, offSuffix = ''] = BOT_TEXT.en.statsNodeOff.split('{node}');

    expect(lineOf(up)?.startsWith(BOT_TEXT.en.statsNodeUp.replace('{node}', ''))).toBe(true);
    expect(lineOf(quiet)).toContain('ago');
    expect(lineOf(off)?.endsWith(offSuffix)).toBe(true);
  });

  it('does not call a node down before the alert would', () => {
    const lines = statsText({
      stats: stats({ nodes: [node({ healthyAt: addMinutes(subMinutes(NOW, OWNER_ALERT.nodeDownAfterMinutes), 1) })] }),
      locale: 'en',
      now: NOW
    });

    expect(lines).not.toContain('ago');
  });

  it('says so when there are no nodes rather than printing an empty list', () => {
    expect(statsText({ stats: stats({ nodes: [] }), locale: 'ru', now: NOW })).toContain(BOT_TEXT.ru.statsNoNodes);
  });
});
