'use client';

import type { ComponentProps, ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { NextIntlClientProvider } from 'next-intl';
import dynamic from 'next/dynamic';

import type { Locale } from '@/shared/i18n';

import { queryClient } from '@/shared/api';
import { TIME_ZONE } from '@/shared/i18n';

import { AuthProvider } from './AuthProvider';

const AppToaster = dynamic(() => import('@/ui-kit').then((module) => module.AppToaster), { ssr: false });

type AppProvidersProps = {
  children: ReactNode;
  locale: Locale;
  messages: ComponentProps<typeof NextIntlClientProvider>['messages'];
};

export const AppProviders = ({ children, locale, messages }: AppProvidersProps) => (
  <QueryClientProvider client={queryClient}>
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={TIME_ZONE}>
      <MotionConfig reducedMotion='user'>
        <AuthProvider>{children}</AuthProvider>
      </MotionConfig>

      <AppToaster />
    </NextIntlClientProvider>
  </QueryClientProvider>
);
