import type { ExecutionContext } from '@nestjs/common';

import { applyDecorators, Controller, createParamDecorator, NotFoundException, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';

import type { AdminRequest, CurrentAdminUser } from './admin.types';

import { ADMIN_THROTTLE } from './admin.config';
import { AdminGuard } from './admin.guard';

export const AdminController = (path: string) =>
  applyDecorators(OptionalAuth(), UseGuards(AdminGuard), Throttle(ADMIN_THROTTLE.read), Controller(path));

export const CurrentAdmin = createParamDecorator((_data: unknown, ctx: ExecutionContext): CurrentAdminUser => {
  const request = ctx.switchToHttp().getRequest<AdminRequest>();

  if (!request.admin) {
    throw new NotFoundException(`Cannot ${request.method} ${request.originalUrl}`);
  }

  return request.admin;
});
