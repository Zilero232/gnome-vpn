import type { AppConfigService } from '@/config';

import { YooKassaClient } from './yookassa';

export const makeYooKassaClient = (config: AppConfigService): YooKassaClient =>
  new YooKassaClient({
    shopId: config.get('yookassa').shopId,
    secretKey: config.get('yookassa').secretKey
  });
