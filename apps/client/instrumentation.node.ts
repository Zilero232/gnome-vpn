import { env } from '@/shared/config/client-env';
import { serverLogger } from '@/shared/lib/server-logger';

serverLogger.info('web server ready', {
  version: env.NEXT_PUBLIC_APP_VERSION,
  apiUrl: env.NEXT_PUBLIC_API_URL
});
