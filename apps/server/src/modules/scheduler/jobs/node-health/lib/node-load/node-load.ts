import { isNonNullish } from 'remeda';

import type { NodeHealth } from '../../../../../../lib';

import { ALERT } from '../../../../config';

export const isOverloaded = ({ cpu, memoryRatio }: NodeHealth): boolean =>
  (isNonNullish(cpu) && cpu >= ALERT.nodeCpuPercent) || (isNonNullish(memoryRatio) && memoryRatio >= ALERT.nodeMemoryRatio);
