import { incyAgent } from '@/modules/devices';

import { MAX_AGENT_LENGTH } from './client-platform.constants';

export const clientPlatform = (userAgent: string | null): string | null => {
  if (!userAgent) {
    return null;
  }

  const incy = incyAgent(userAgent.trim());

  if (!incy) {
    return userAgent.slice(0, MAX_AGENT_LENGTH);
  }

  return `INCY ${incy.platform} ${incy.version}`;
};
