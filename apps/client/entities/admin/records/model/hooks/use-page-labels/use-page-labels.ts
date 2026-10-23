'use client';

import type { AdminPageInfo } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';

import type { PaginationLabels } from '@/ui-kit';

export const usePageLabels = () => {
  const t = useTranslations('admin.common.pages');

  return ({ page, pages, total }: AdminPageInfo): PaginationLabels => ({
    previous: t('previous'),
    next: t('next'),
    status: t('status', { page, pages, total })
  });
};
