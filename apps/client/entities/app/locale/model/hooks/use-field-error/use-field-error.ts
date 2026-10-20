'use client';

import type { FieldError } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { VALIDATION_LIMITS } from './use-field-error.constants';

export const useFieldError = () => {
  const t = useTranslations();

  return (error: FieldError | undefined): string | undefined => (error?.message ? t(error.message, VALIDATION_LIMITS) : undefined);
};
