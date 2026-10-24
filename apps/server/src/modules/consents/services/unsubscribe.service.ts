import type { UnsubscribeResult } from '@gnomevpn/schemas';

import { Injectable } from '@nestjs/common';
import { isNullish } from 'remeda';

import { AppConfigService } from '@/config';
import { PrismaService } from '@/core';
import { localizedPath } from '@/lib/email';

import type { UnsubscribeLinkInput } from '../consents.types';

import { UNSUBSCRIBE } from '../config';
import { readUnsubscribe, signUnsubscribe } from '../lib';
import { ConsentService } from './consent.service';

@Injectable()
export class UnsubscribeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly consents: ConsentService
  ) {}

  link({ userId, locale }: UnsubscribeLinkInput): string {
    const url = new URL(localizedPath({ path: UNSUBSCRIBE.path, locale }), this.config.get('app').clientUrl);

    url.searchParams.set(UNSUBSCRIBE.tokenParam, signUnsubscribe({ userId, secret: this.secret() }));

    return url.toString();
  }

  async unsubscribe(token: string): Promise<UnsubscribeResult> {
    const userId = readUnsubscribe({ token, secret: this.secret() });

    if (isNullish(userId)) {
      return { outcome: 'invalid' };
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });

    if (user) {
      await this.consents.setMarketing({ userId, granted: false, source: 'email' });
    }

    return { outcome: 'unsubscribed' };
  }

  private secret(): string {
    return this.config.get('auth').secret;
  }
}
