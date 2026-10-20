import { clsx } from 'clsx';

import { AVATAR } from '@/shared/config';

import type { AvatarProps } from './Avatar.types';

import { GnomeBadge } from '../GnomeBadge';

import s from './Avatar.module.scss';

export const Avatar = ({ seed, size = AVATAR.size, className, ...props }: AvatarProps) => {
  const palette = AVATAR.palettes[Number.parseInt(seed.slice(-6), 16) % AVATAR.palettes.length] ?? AVATAR.palettes[0];

  return (
    <span aria-hidden className={clsx(s.root, className)} style={{ width: size, height: size }} {...props}>
      <GnomeBadge className={s.image} palette={palette} size={size} />
    </span>
  );
};
