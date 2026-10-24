import { match } from 'ts-pattern';

import { BOT_TEXT } from '@/modules/telegram/config';

import type { NodeLineInput } from './stats-text.types';

import { fillText } from '../fill-text';
import { formatAgo } from '../format-date';
import { nodeStatus } from '../node-health';
import { nodeLabel } from '../node-label';

export const nodeLine = ({ node, locale, now }: NodeLineInput): string => {
  const text = BOT_TEXT[locale];
  const label = nodeLabel({ node, locale });

  return match(nodeStatus({ isAvailable: node.isAvailable, healthyAt: node.healthyAt, now }))
    .with('up', () => fillText({ text: text.statsNodeUp, fill: { node: label } }))
    .with('down', () => fillText({ text: text.statsNodeDown, fill: { node: label, ago: formatAgo({ date: node.healthyAt, now, locale }) } }))
    .with('off', () => fillText({ text: text.statsNodeOff, fill: { node: label } }))
    .exhaustive();
};
