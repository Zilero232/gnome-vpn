import { SITE } from '@/shared/config';

import type { BrandMarkProps } from './BrandMark.types';

import { GnomeBadge } from '../GnomeBadge';
import { brandMark } from './BrandMark.variants';

import s from './BrandMark.module.scss';

const LOGO_SIZE = { sm: 24, md: 30, lg: 34 } as const;

export const BrandMark = ({ size = 'md', tone = 'default', labelClassName, className }: BrandMarkProps) => (
  <span className={brandMark({ size, tone, class: className })}>
    <GnomeBadge className={s.logo} size={LOGO_SIZE[size]} />
    <span className={labelClassName}>{SITE.name}</span>
  </span>
);
