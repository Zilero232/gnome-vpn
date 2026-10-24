import type { AdminSession } from '@gnomevpn/schemas';

import { adminSessionSchema } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { isEmpty, isNullish } from 'remeda';

import { AppConfigService } from '@/config';
import { PrismaService } from '@/core';

import type { CurrentAdminUser } from '../admin.types';

import { isAdmin } from '../lib';

@Injectable()
export class AdminAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService
  ) {}

  async adminOf(userId: string | undefined): Promise<CurrentAdminUser | null> {
    const admins = this.config.get('auth').adminEmails;

    if (isNullish(userId) || isEmpty(admins)) {
      return null;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, emailVerified: true } });

    if (isNullish(user) || !isAdmin({ email: user.email, emailVerified: user.emailVerified, admins })) {
      return null;
    }

    return { userId, email: user.email.toLowerCase() };
  }

  session(admin: CurrentAdminUser): AdminSession {
    return adminSessionSchema.parse({ email: admin.email });
  }
}
