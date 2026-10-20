import localFont from 'next/font/local';

export const fontSans = localFont({
  src: [
    { path: './files/manrope-symbols.woff2', weight: '200 800', style: 'normal' },
    { path: './files/manrope-latin.woff2', weight: '200 800', style: 'normal' },
    { path: './files/manrope-cyrillic.woff2', weight: '200 800', style: 'normal' }
  ],
  variable: '--font-manrope',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif']
});

export const fontSerif = localFont({
  src: [
    { path: './files/literata-symbols.woff2', weight: '200 900', style: 'normal' },
    { path: './files/literata-latin.woff2', weight: '200 900', style: 'normal' },
    { path: './files/literata-cyrillic.woff2', weight: '200 900', style: 'normal' }
  ],
  variable: '--font-literata',
  display: 'block',
  adjustFontFallback: 'Times New Roman',
  fallback: ['Georgia', 'serif']
});

export const fontMono = localFont({
  src: [
    { path: './files/jetbrains-mono-symbols.woff2', weight: '100 800', style: 'normal' },
    { path: './files/jetbrains-mono-latin.woff2', weight: '100 800', style: 'normal' },
    { path: './files/jetbrains-mono-cyrillic.woff2', weight: '100 800', style: 'normal' }
  ],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false,
  fallback: ['ui-monospace', 'monospace']
});
