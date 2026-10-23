'use client';

import type { Gift } from '@gnomevpn/schemas';

import { formatGiftCode } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';

import { isBrowser } from '@/shared/lib';
import { copyWithToast } from '@/ui-kit';

export const useShareGift = () => {
  const t = useTranslations('gifts');

  return async ({ code, link }: Gift): Promise<void> => {
    const text = t('shareText', { code: formatGiftCode(code) });

    if (isBrowser() && typeof navigator.share === 'function') {
      try {
        await navigator.share({ text, url: link });

        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }

    await copyWithToast({ value: `${text} ${link}`, success: t('linkCopied'), failure: t('copyFailed') });
  };
};
