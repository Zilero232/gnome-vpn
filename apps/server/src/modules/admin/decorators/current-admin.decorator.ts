import type { ExecutionContext } from '@nestjs/common';

import { createParamDecorator, NotFoundException } from '@nestjs/common';

import type { AdminRequest, CurrentAdminUser } from '../admin.types';

export const CurrentAdmin = createParamDecorator((_data: unknown, ctx: ExecutionContext): CurrentAdminUser => {
  const request = ctx.switchToHttp().getRequest<AdminRequest>();

  if (!request.admin) {
    throw new NotFoundException(`Cannot ${request.method} ${request.originalUrl}`);
  }

  return request.admin;
});
