import type { CanActivate, ExecutionContext } from '@nestjs/common';

import { Injectable, NotFoundException } from '@nestjs/common';
import { isNullish } from 'remeda';

import type { AdminRequest } from './admin.types';

import { AdminAccessService } from './admin-access.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly access: AdminAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const admin = await this.access.adminOf(request.session?.user.id);

    if (isNullish(admin)) {
      throw new NotFoundException(`Cannot ${request.method} ${request.originalUrl}`);
    }

    request.admin = admin;

    return true;
  }
}
