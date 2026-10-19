import type { NextRequest } from 'next/server';

import createMiddleware from 'next-intl/middleware';

import { routing } from '@/shared/i18n';
import { rememberReferral } from '@/shared/lib/referral-cookie';

const intl = createMiddleware(routing);

export const proxy = (request: NextRequest) => {
  const response = intl(request);

  rememberReferral({ request, response });

  return response;
};

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
