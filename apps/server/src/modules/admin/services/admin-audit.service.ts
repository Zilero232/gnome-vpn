import { Injectable, Logger } from '@nestjs/common';

import type { RecordAdminActionInput } from '../admin.types';

import { describeError } from '../../../common/lib';
import { PrismaService } from '../../../core';

@Injectable()
export class AdminAuditService {
  private readonly logger = new Logger(AdminAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record({ admin, action, targetUserId = null, details }: RecordAdminActionInput): Promise<void> {
    await this.prisma.adminAction.create({ data: { adminEmail: admin.email, action, targetUserId, details } }).catch((error: unknown) => {
      this.logger.error(
        `admin ${admin.email} ${action} on ${targetUserId ?? 'no account'} was not written to the action log: ${describeError(error)}`
      );
    });
  }
}
