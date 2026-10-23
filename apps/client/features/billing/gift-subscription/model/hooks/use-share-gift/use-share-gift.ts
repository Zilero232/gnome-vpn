'use client';

import type { Gift } from '@gnomevpn/schemas';

import { formatGiftCode } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';

import { shareOrFallback } from '@/shared/lib';
import { copyWithToast } from '@/ui-kit';

export const useShareGift = () => {
  const t = useTranslations('gifts');

  return ({ code, link }: Gift): Promise<void> => {
    const text = t('shareText', { code: formatGiftCode(code) });

    return shareOrFallback({
      data: { text, url: link },
      fallback: () => copyWithToast({ value: `${text} ${link}`, success: t('linkCopied'), failure: t('copyFailed') })
    });
  };
};
