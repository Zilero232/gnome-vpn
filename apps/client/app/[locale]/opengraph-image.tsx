import { LOWEST_MONTHLY_RUB } from '@gnomevpn/schemas';
import { createTranslator } from 'next-intl';
import { ImageResponse } from 'next/og';

import { SITE } from '@/shared/config';
import { messages, resolveLocale } from '@/shared/i18n';
import { ScenePoster } from '@/ui-kit';

import type { OgImageProps } from './opengraph-image.types';

import { OG_COLORS as C, OG_FAMILY, OG_SIZE } from './opengraph-image.constants';
import { loadOgFonts } from './opengraph-image.fonts';

export const alt = SITE.name;
export const size = OG_SIZE;
export const contentType = 'image/png';

const Image = async ({ params }: OgImageProps) => {
  const locale = resolveLocale((await params).locale);
  const t = createTranslator({ locale, messages: messages[locale], namespace: 'common' });
  const fonts = await loadOgFonts();

  const [before, after] = t('ogTitle').split(t('ogAccent'));

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: '60px 64px',
        backgroundColor: C.paper,
        color: C.ink,
        fontFamily: OG_FAMILY.sans
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, paddingRight: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: OG_FAMILY.serif, fontSize: 34 }}>{SITE.name}</span>
          <span style={{ fontSize: 24, color: C.muted }}>{new URL(SITE.url).host}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', fontFamily: OG_FAMILY.serif, fontSize: 72, lineHeight: 1.08, letterSpacing: '-0.02em' }}>
            <span>{before}</span>
            <span style={{ backgroundColor: C.highlight, padding: '0 12px', margin: '0 4px' }}>{t('ogAccent')}</span>
            <span>{after}</span>
          </div>
          <div style={{ marginTop: 26, fontSize: 27, lineHeight: 1.45, color: C.muted }}>{t('ogDescription')}</div>
        </div>

        <div style={{ display: 'flex', paddingTop: 22, borderTop: `2px solid ${C.line}`, fontSize: 27, color: C.accent }}>
          {t('ogOffer', { price: LOWEST_MONTHLY_RUB })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ScenePoster height={460} width={400} />
      </div>
    </div>,
    { ...size, fonts }
  );
};

export default Image;
