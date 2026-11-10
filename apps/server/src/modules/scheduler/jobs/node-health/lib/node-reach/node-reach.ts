import { createConnection } from 'node:net';
import { setTimeout as sleep } from 'node:timers/promises';

import type { ReachTarget } from './node-reach.types';

import { NODE_REACH } from './node-reach.constants';
import { lossPercent } from './node-reach.helpers';

const connects = ({ host, port }: ReachTarget): Promise<boolean> =>
  new Promise((resolve) => {
    const socket = createConnection({ host, port, timeout: NODE_REACH.timeoutMs });

    const settle = (isConnected: boolean) => {
      socket.destroy();
      resolve(isConnected);
    };

    socket.once('connect', () => settle(true));
    socket.once('timeout', () => settle(false));
    socket.once('error', () => settle(false));
  });

export const reachLoss = async (target: ReachTarget): Promise<number> => {
  let failures = 0;

  for (let attempt = 0; attempt < NODE_REACH.attempts; attempt += 1) {
    if (!(await connects(target))) {
      failures += 1;
    }

    await sleep(NODE_REACH.gapMs);
  }

  return lossPercent({ attempts: NODE_REACH.attempts, failures });
};
