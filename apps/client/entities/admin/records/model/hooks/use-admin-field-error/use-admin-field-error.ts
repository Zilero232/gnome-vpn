'use client';

import type { FieldError } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { ADMIN_LIMITS } from './use-admin-field-error.constants';

export const useAdminFieldError = () => {
  const t = useTranslations();

  return (error: FieldError | undefined): string | undefined => (error?.message ? t(error.message, ADMIN_LIMITS) : undefined);
};
