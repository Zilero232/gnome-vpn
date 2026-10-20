import { GNOME_COLORS } from '@/shared/config';

import type { GnomeBadgeProps } from './GnomeBadge.types';

export const GnomeBadge = ({ size = 40, palette = GNOME_COLORS, className }: GnomeBadgeProps) => (
  <svg aria-hidden className={className} fill='none' height={size} viewBox='0 0 256 256' width={size} xmlns='http://www.w3.org/2000/svg'>
    <circle cx='128' cy='128' fill={palette.night} r='128' />
    <path d='M128 30 72 116h112L128 30Z' fill={palette.hat} />
    <path d='M128 30 102 70l30 46h52L128 30Z' fill={palette.hatShade} />
    <path d='M82 128h92c4 0 6 3 6 7 0 44-23 86-52 86s-52-42-52-86c0-4 2-7 6-7Z' fill={GNOME_COLORS.beard} />
    <circle cx='108' cy='152' fill={GNOME_COLORS.eye} r='7.5' />
    <circle cx='148' cy='152' fill={GNOME_COLORS.eye} r='7.5' />
    <ellipse cx='128' cy='174' fill={GNOME_COLORS.nose} rx='18' ry='14.5' />
    <rect fill={GNOME_COLORS.beard} height='22' rx='11' width='132' x='62' y='110' />
    <circle cx='128' cy='30' fill={GNOME_COLORS.beard} r='13' />
  </svg>
);
