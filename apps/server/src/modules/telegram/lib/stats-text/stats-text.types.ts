import type { StatsSnapshot } from '@/modules/admin';
import type { BotLocale } from '@/modules/telegram/telegram.types';

import type { LabelledNode } from '../node-label';

export type StatsNode = LabelledNode & {
  isAvailable: boolean;
  healthyAt: Date;
};

export type BotStats = Omit<StatsSnapshot, 'nodes'> & {
  nodes: StatsNode[];
};

export type StatsTextInput = {
  stats: BotStats;
  locale: BotLocale;
  now: Date;
};

export type NodeLineInput = {
  node: StatsNode;
  locale: BotLocale;
  now: Date;
};
