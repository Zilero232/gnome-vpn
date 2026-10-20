'use client';

import { useLocale as useActiveLocale } from 'next-intl';
import { useTransition } from 'react';

import type { Locale } from '@/shared/i18n';

import { resolveLocale } from '@/shared/i18n';
import { usePathname, useRouter } from '@/shared/i18n/navigation';

import type { UseLocale } from './use-locale.types';

export const useLocale = (): UseLocale => {
  const active = useActiveLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const setLocale = (locale: Locale) => {
    const { search, hash } = window.location;

    startTransition(() => {
      router.replace(`${pathname}${search}${hash}`, { locale });
    });
  };

  return { locale: resolveLocale(active), isPending, setLocale };
};
