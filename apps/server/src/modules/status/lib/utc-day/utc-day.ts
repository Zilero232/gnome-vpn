import type { AddUtcDaysInput } from './utc-day.types';

import { UTC_DAY } from './utc-day.constants';

export const utcDay = (date: Date): Date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const addUtcDays = ({ day, days }: AddUtcDaysInput): Date => new Date(day.getTime() + days * UTC_DAY.ms);

export const dayKey = (day: Date): string => day.toISOString().slice(0, UTC_DAY.keyLength);
