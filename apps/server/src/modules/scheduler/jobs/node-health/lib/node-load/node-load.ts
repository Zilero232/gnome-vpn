import { isNonNullish } from 'remeda';

import type { NodeHealth } from '@/lib/xray';

import { ALERT } from '@/modules/scheduler/config';

import type { NextLoadStreakInput } from './node-load.types';

export const isOverloaded = ({ cpu, memoryRatio }: NodeHealth): boolean =>
  (isNonNullish(cpu) && cpu >= ALERT.nodeCpuPercent) || (isNonNullish(memoryRatio) && memoryRatio >= ALERT.nodeMemoryRatio);

export const nextLoadStreak = ({ previous, isHot }: NextLoadStreakInput): number => {
  if (!isHot) {
    return 0;
  }

  return previous + 1;
};

export const isSustainedLoad = (streak: number): boolean => streak >= ALERT.loadStreakMinutes;
