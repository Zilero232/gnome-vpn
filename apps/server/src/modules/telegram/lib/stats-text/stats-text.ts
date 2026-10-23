import { isEmpty, sumBy } from 'remeda';

import type { StatsTextInput } from './stats-text.types';

import { BOT_TEXT, NEW_LINE } from '../../config';
import { dayCount } from '../day-count';
import { fillLabel, fillText } from '../fill-text';
import { formatAmount } from '../format-amount';
import { html } from '../html';
import { planLabel } from '../plan-label';
import { nodeLine } from './stats-text.helpers';

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
  ].join(NEW_LINE);

  const nodes = isEmpty(stats.nodes) ? text.statsNoNodes : stats.nodes.map((node) => nodeLine({ node, locale, now })).join(NEW_LINE);

  return html.paragraphs([text.statsTitle, summary, [text.statsNodes, nodes].join(NEW_LINE)]);
};
