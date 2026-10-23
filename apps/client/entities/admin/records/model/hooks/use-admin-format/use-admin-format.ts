'use client';

import { useFormatter, useTranslations } from 'next-intl';

import { ADMIN_FORMAT } from '../../../config';

export const useAdminFormat = () => {
  const t = useTranslations('admin.format');
  const format = useFormatter();

  return {
    money: (amount: number) => t('money', { amount: format.number(amount, ADMIN_FORMAT.amount) }),
    compactMoney: (amount: number) => t('money', { amount: format.number(amount, ADMIN_FORMAT.compact) }),
    count: (value: number) => format.number(value),
    compactCount: (value: number) => format.number(value, ADMIN_FORMAT.compact),
    percent: (ratio: number) => format.number(ratio, ADMIN_FORMAT.percent),
    date: (iso: string) => format.dateTime(new Date(iso), ADMIN_FORMAT.date),
    dateTime: (iso: string) => format.dateTime(new Date(iso), ADMIN_FORMAT.dateTime),
    day: (key: string) => format.dateTime(new Date(key), ADMIN_FORMAT.day)
  };
};
