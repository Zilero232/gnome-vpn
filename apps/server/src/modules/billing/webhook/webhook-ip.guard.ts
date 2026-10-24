import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { Injectable } from '@nestjs/common';

import { AppForbiddenException } from '@/common/exceptions';

import { isAllowedWebhookIp } from './webhook-ip.helpers';

@Injectable()
export class WebhookIpGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip ?? request.socket.remoteAddress ?? '';

    if (!isAllowedWebhookIp(ip)) {
      throw new AppForbiddenException('WEBHOOK_INVALID', 'Webhook source not allowed');
    }

    return true;
  }
}
