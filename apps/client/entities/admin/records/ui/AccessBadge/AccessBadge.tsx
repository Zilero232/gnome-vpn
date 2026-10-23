'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/ui-kit';

import type { AccessBadgeProps } from './AccessBadge.types';

import { ACCESS_TONE } from '../../config';

export const AccessBadge = ({ access, className }: AccessBadgeProps) => {
  const t = useTranslations('admin.records.access');

  return (
    <Badge className={className} tone={ACCESS_TONE[access]}>
      {t(access)}
    </Badge>
  );
};
