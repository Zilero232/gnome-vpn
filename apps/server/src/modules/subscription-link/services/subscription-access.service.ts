import { Injectable, Logger } from '@nestjs/common';

import { describeError } from '@/common/lib';
import { PeersService } from '@/modules/peers';

import type { SetEnabledAllInput } from '../subscription-link.service.types';

@Injectable()
export class SubscriptionAccessService {
  private readonly logger = new Logger(SubscriptionAccessService.name);

  constructor(private readonly peers: PeersService) {}

  async setEnabledAll({ userId, enabled, owner }: SetEnabledAllInput): Promise<number> {
    const changed = await this.peers.setEnabled({ where: { userId, kind: 'config', revokedAt: null, ...(owner && { user: owner }) }, enabled });

    if (!enabled) {
      return changed;
    }

    void this.peers.pushEnabled(userId).catch((error: unknown) => {
      this.logger.warn(`enabling the clients of ${userId} on the nodes failed, the sweep will: ${describeError(error)}`);
    });

    return changed;
  }
}
