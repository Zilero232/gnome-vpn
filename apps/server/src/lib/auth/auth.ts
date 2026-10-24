import { isPlaceholderEmail } from '@gnomevpn/schemas';
import { Logger } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { bearer } from 'better-auth/plugins';
import { createElement } from 'react';

import { describeError } from '@/common/lib';
import { env } from '@/config';
import { allowedOrigins } from '@/config/cors';
import { basePrisma } from '@/core';

import { ActionEmail, EMAIL_TEXT, sendEmail } from '../email';
import { AUTH_PATHS, SESSION } from './auth.constants';
import { claimedEmail, returnedUserId, withClientCallback } from './auth.helpers';
import { emailLocaleFor, rememberLocale } from './user-locale';

const logger = new Logger('Auth');

export const auth = betterAuth({
  basePath: '/auth',
  baseURL: env.app.apiUrl,
  secret: env.auth.secret,
  trustedOrigins: allowedOrigins,
  session: SESSION,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }, request) => {
      const locale = await emailLocaleFor({ userId: user.id, headers: request?.headers });

      await sendEmail({
        to: user.email,
        subject: EMAIL_TEXT[locale].reset.subject,
        react: createElement(ActionEmail, { copy: 'reset', url, locale })
      });
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: false,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      const locale = await emailLocaleFor({ userId: user.id, headers: request?.headers });

      void sendEmail({
        to: user.email,
        subject: EMAIL_TEXT[locale].verify.subject,
        react: createElement(ActionEmail, { copy: 'verify', locale, url: withClientCallback({ url, locale, path: AUTH_PATHS.account }) })
      }).catch((error: unknown) => {
        logger.error(`verification email for ${user.id} failed: ${describeError(error)}`);
      });
    }
  },
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
      sendChangeEmailConfirmation: async ({ user, url, newEmail }, request) => {
        const locale = await emailLocaleFor({ userId: user.id, headers: request?.headers });

        await sendEmail({
          to: user.email,
          subject: EMAIL_TEXT[locale].change.subject,
          react: createElement(ActionEmail, {
            copy: 'change',
            locale,
            url: withClientCallback({ url, locale, path: AUTH_PATHS.account }),
            fill: { email: newEmail }
          })
        });
      }
    }
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const email = claimedEmail({ path: ctx.path, body: ctx.body });

      if (email && isPlaceholderEmail(email)) {
        throw new APIError('BAD_REQUEST', { message: 'This address cannot be used' });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      const userId = ctx.context.newSession?.user.id ?? returnedUserId(ctx.context.returned);

      void rememberLocale({ path: ctx.path, headers: ctx.headers, userId }).catch((error: unknown) => {
        logger.warn(`could not remember the locale of ${userId}: ${describeError(error)}`);
      });
    })
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await basePrisma.subscription.create({
            data: { userId: user.id }
          });
        }
      }
    }
  },
  plugins: [bearer()],
  database: prismaAdapter(basePrisma, { provider: 'postgresql' })
});
