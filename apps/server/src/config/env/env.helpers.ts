import { z } from 'zod';

export const flag = (fallback: 'false' | 'true') =>
  z
    .enum(['true', 'false'])
    .default(fallback)
    .transform((value) => value === 'true');

export const emailList = (value: string): string[] => [
  ...new Set(
    value
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter((entry) => entry !== '')
  )
];
