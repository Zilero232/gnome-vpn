import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { OgFontInput } from './opengraph-image.types';

const font = async ({ name, file }: OgFontInput) => ({ name, data: await file, weight: 500 as const, style: 'normal' as const });

export const loadOgFonts = () =>
  Promise.all([
    font({ name: 'Literata', file: readFile(join(process.cwd(), 'shared/config/fonts/files/og/literata-latin-500.woff')) }),
    font({ name: 'LiterataCyrillic', file: readFile(join(process.cwd(), 'shared/config/fonts/files/og/literata-cyrillic-500.woff')) }),
    font({ name: 'Manrope', file: readFile(join(process.cwd(), 'shared/config/fonts/files/og/manrope-latin-500.woff')) }),
    font({ name: 'ManropeCyrillic', file: readFile(join(process.cwd(), 'shared/config/fonts/files/og/manrope-cyrillic-500.woff')) }),
    font({ name: 'ManropeExt', file: readFile(join(process.cwd(), 'shared/config/fonts/files/og/manrope-latin-ext-500.woff')) })
  ]);
