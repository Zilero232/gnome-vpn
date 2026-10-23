import type { ConsentState } from '@gnomevpn/schemas';

import { MARKETING_CONSENT_VERSION } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { isEmpty } from 'remeda';

import type { RecordPersonalDataInput, SetMarketingInput } from '../consents.types';

import { PrismaService } from '../../../core';
import { CONSENT_ORDER } from '../config';
import { consentState } from '../lib';

@Injectable()
export class ConsentService {
  constructor(private readonly prisma: PrismaService) {}

  async state(userId: string): Promise<ConsentState> {
    const rows = await this.prisma.consent.findMany({
      where: { userId },
      orderBy: [...CONSENT_ORDER],
      distinct: ['kind'],
      select: { kind: true, version: true, granted: true, createdAt: true }
    });

    return consentState(rows);
  }

  async setMarketing({ userId, granted, source }: SetMarketingInput): Promise<ConsentState> {
    const current = await this.state(userId);

    if (current.marketing?.granted === granted) {
      return current;
    }

    await this.prisma.consent.create({ data: { userId, kind: 'marketing', version: MARKETING_CONSENT_VERSION, granted, source } });

    return this.state(userId);
  }

  async recordPersonalData({ userId, version, source }: RecordPersonalDataInput): Promise<ConsentState> {
    const current = await this.state(userId);

    if (current.personalData?.granted && current.personalData.version === version) {
      return current;
    }

    await this.prisma.consent.create({ data: { userId, kind: 'personalData', version, granted: true, source } });

    return this.state(userId);
  }

  async marketingAudience(userIds: string[]): Promise<Set<string>> {
    if (isEmpty(userIds)) {
      return new Set();
    }

    const latest = await this.prisma.consent.findMany({
      where: { userId: { in: userIds }, kind: 'marketing' },
      orderBy: [...CONSENT_ORDER],
      distinct: ['userId'],
      select: { userId: true, granted: true }
    });

    return new Set(latest.filter((row) => row.granted).map((row) => row.userId));
  }

  async isMarketingGranted(userId: string): Promise<boolean> {
    const audience = await this.marketingAudience([userId]);

    return audience.has(userId);
  }
}
