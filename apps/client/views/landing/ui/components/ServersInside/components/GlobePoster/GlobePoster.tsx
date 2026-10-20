import type { GlobePosterProps } from './GlobePoster.types';

import { GLOBE_POSTER } from '../../../../../config';

export const GlobePoster = ({ className }: GlobePosterProps) => (
  <picture>
    <source sizes={GLOBE_POSTER.sizes} srcSet={GLOBE_POSTER.avif} type='image/avif' />
    <source sizes={GLOBE_POSTER.sizes} srcSet={GLOBE_POSTER.webp} type='image/webp' />
    <img
      alt=''
      className={className}
      decoding='async'
      height={GLOBE_POSTER.size}
      loading='lazy'
      sizes={GLOBE_POSTER.sizes}
      src={GLOBE_POSTER.fallback}
      width={GLOBE_POSTER.size}
    />
  </picture>
);
