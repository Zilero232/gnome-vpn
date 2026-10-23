import { range } from 'remeda';

import type { AddUtcDaysInput, DayWindowInput, WindowStartInput } from './utc-day.types';

import { UTC_DAY } from './utc-day.constants';

export const utcDay = (date: Date): Date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const addUtcDays = ({ day, days }: AddUtcDaysInput): Date => new Date(day.getTime() + days * UTC_DAY.ms);

export const dayKey = (day: Date): string => day.toISOString().slice(0, UTC_DAY.keyLength);

export const windowStart = ({ now, days }: WindowStartInput): Date => addUtcDays({ day: utcDay(now), days: 1 - days });

export const dayKeys = ({ start, days }: DayWindowInput): string[] =>
  range(0, days).map((offset) => dayKey(addUtcDays({ day: start, days: offset })));
