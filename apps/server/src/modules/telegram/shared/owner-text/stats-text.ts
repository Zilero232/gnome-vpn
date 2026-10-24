import { isEmpty, sumBy } from 'remeda';
import { match } from 'ts-pattern';

import { BOT_TEXT } from '@/modules/telegram/config';

import type { NodeLineInput, StatsTextInput } from './owner-text.types';

import { dayCount, fillLabel, fillText, formatAgo, formatAmount, html, nodeLabel, planLabel } from '../text';
import { nodeStatus } from './node-health';

const nodeLine = ({ node, locale, now }: NodeLineInput): string => {
  const text = BOT_TEXT[locale];
  const label = nodeLabel({ node, locale });

  return match(nodeStatus({ isAvailable: node.isAvailable, healthyAt: node.healthyAt, now }))
    .with('up', () => fillText({ text: text.statsNodeUp, fill: { node: label } }))
    .with('down', () => fillText({ text: text.statsNodeDown, fill: { node: label, ago: formatAgo({ date: node.healthyAt, now, locale }) } }))
    .with('off', () => fillText({ text: text.statsNodeOff, fill: { node: label } }))
    .exhaustive();
};

export const statsText = ({ stats, locale, now }: StatsTextInput): string => {
  const text = BOT_TEXT[locale];
  const { users, subscriptions, payments } = stats;
  const plans = subscriptions.paid
    .map(({ plan, count }) => fillLabel({ text: text.statsPlan, fill: { plan: planLabel({ planId: plan, locale }), count: String(count) } }))
    .join(' · ');

  const summary = [
    fillText({ text: text.statsUsers, fill: { count: String(users.total), day: String(users.day), week: String(users.week) } }),
    fillText({ text: text.statsPaid, fill: { count: String(sumBy(subscriptions.paid, (entry) => entry.count)), plans } }),
    fillText({ text: text.statsTrials, fill: { count: String(subscriptions.trials) } }),
    fillText({ text: text.statsAutoRenew, fill: { count: String(subscriptions.autoRenew) } }),
    fillText({
      text: text.statsPayments,
      fill: {
        days: dayCount({ days: payments.days, locale }),
        count: String(payments.count),
        amount: formatAmount({ amount: payments.amount, locale })
      }
    }),
    fillText({ text: text.statsDevices, fill: { count: String(stats.devices), chats: String(stats.chats) } })
  ].join('\n');

  const nodes = isEmpty(stats.nodes) ? text.statsNoNodes : stats.nodes.map((node) => nodeLine({ node, locale, now })).join('\n');

  return html.paragraphs([text.statsTitle, summary, [text.statsNodes, nodes].join('\n')]);
};
