export const GLOBE_ORIGIN = { lat: 55.75, lon: 37.62 } as const;

export const GLOBE_LABEL_SIDE = {
  origin: 'below',
  netherlands: 'left',
  finland: 'above'
} as const;

export const GLOBE_POSTER = {
  avif: '/landing/globe-480.avif 480w, /landing/globe-960.avif 960w',
  webp: '/landing/globe-480.webp 480w, /landing/globe-960.webp 960w',
  fallback: '/landing/globe-480.webp',
  sizes: '(min-width: 900px) 520px, min(480px, 100vw - 32px)',
  size: 480
} as const;
