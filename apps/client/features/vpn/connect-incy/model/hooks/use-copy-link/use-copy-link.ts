import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { copyWithToast } from '@/ui-kit';

import type { CopyLinkInput } from './use-copy-link.types';

import { COPIED_RESET_MS } from './use-copy-link.constants';

export const useCopyLink = () => {
  const t = useTranslations('incy');

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) {
      return;
    }

    const timer = setTimeout(setIsCopied, COPIED_RESET_MS, false);

    return () => clearTimeout(timer);
  }, [isCopied]);

  const copy = async ({ value, message }: CopyLinkInput) => {
    if (await copyWithToast({ value, success: message, failure: t('copyFailed') })) {
      setIsCopied(true);
    }
  };

  return { isCopied, copy };
};
