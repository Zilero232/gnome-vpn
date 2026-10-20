import { Injectable, Logger } from '@nestjs/common';
import { subDays } from 'date-fns';
import { isNonNullish } from 'remeda';

import { AppBadRequestException } from '../../../common/exceptions';
import { PrismaService } from '../../../core';
import { PEER_REF_SELECT, PeersService } from '../../peers';
import { TrialService } from '../../subscription';
import { ACCOUNT_DELETION } from '../config';
import { IdentityService } from './identity.service';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly peers: PeersService,
    private readonly identity: IdentityService,
    private readonly trial: TrialService
  ) {}

  async remove(userId: string): Promise<void> {
    const pending = await this.prisma.payment.findFirst({
      where: { userId, status: 'pending', createdAt: { gt: subDays(new Date(), ACCOUNT_DELETION.pendingLookbackDays) } },
      select: { id: true }
    });

    if (isNonNullish(pending)) {
      throw new AppBadRequestException('ACCOUNT_PAYMENT_PENDING', 'A payment is still being processed; delete the account once it settles');
    }

    await this.trial.remember({ userId });

    const peers = await this.prisma.peer.findMany({ where: { userId }, select: PEER_REF_SELECT });

    await this.peers.releaseDetached(peers);

    await this.identity.deleteUser(userId);

    this.logger.log(`account ${userId} removed with ${peers.length} peers`);
  }
}
