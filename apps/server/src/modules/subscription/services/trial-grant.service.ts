import { Injectable } from '@nestjs/common';

import { AppBadRequestException } from '@/common/exceptions';
import { isUniqueViolation, PrismaService } from '@/core';

import type { RecordTrialGrantInput, TrialGrantLookupInput } from '../subscription.types';

import { trialIdentities } from '../lib';

@Injectable()
export class TrialGrantService {
  constructor(private readonly prisma: PrismaService) {}

  async identitiesOf({ userId, db = this.prisma }: TrialGrantLookupInput): Promise<string[]> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, telegramAccount: { select: { telegramId: true } } }
    });

    return trialIdentities({ email: user?.email ?? null, telegramId: user?.telegramAccount?.telegramId ?? null });
  }

  async isGranted({ userId, db = this.prisma }: TrialGrantLookupInput): Promise<boolean> {
    const identities = await this.identitiesOf({ userId, db });

    if (identities.length === 0) {
      return false;
    }

    const granted = await db.trialGrant.count({ where: { identityHash: { in: identities } } });

    return granted > 0;
  }

  async record({ userId, db = this.prisma, isStrict }: RecordTrialGrantInput): Promise<void> {
    const identities = await this.identitiesOf({ userId, db });

    if (identities.length === 0) {
      return;
    }

    try {
      await db.trialGrant.createMany({
        data: identities.map((identityHash) => ({ identityHash, userId })),
        skipDuplicates: !isStrict
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppBadRequestException('TRIAL_ALREADY_USED', 'This email or Telegram account has already had its trial');
      }

      throw error;
    }
  }
}
