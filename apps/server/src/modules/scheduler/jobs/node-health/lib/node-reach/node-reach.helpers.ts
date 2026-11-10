import type { LossPercentInput } from './node-reach.types';

export const lossPercent = ({ attempts, failures }: LossPercentInput): number => (attempts > 0 ? Math.round((failures * 100) / attempts) : 0);
