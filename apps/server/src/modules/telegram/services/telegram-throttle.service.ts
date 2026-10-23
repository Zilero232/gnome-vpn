import { Injectable } from '@nestjs/common';
import { InjectThrottlerStorage, ThrottlerStorage } from '@nestjs/throttler';

import type { AllowInput } from '../telegram.types';

import { BOT_THROTTLE } from '../config';

@Injectable()
export class TelegramThrottleService {
  constructor(@InjectThrottlerStorage() private readonly storage: ThrottlerStorage) {}

  async allow({ throttle, key }: AllowInput): Promise<boolean> {
    const { windowMs, limit } = BOT_THROTTLE.limits[throttle];
    const hit = await this.storage.increment(`${BOT_THROTTLE.keyPrefix}:${throttle}:${key}`, windowMs, limit, BOT_THROTTLE.blockMs, throttle);

    return !hit.isBlocked;
  }
}
