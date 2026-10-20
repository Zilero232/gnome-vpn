import { useTranslations } from 'next-intl';

import { ABOUT_CLOSING, ABOUT_FACTS, ABOUT_STORY } from '@/entities/app/about';
import { GnomeBadge, Reveal, Text } from '@/ui-kit';
import { PageIntro } from '@/widgets/site/page-intro';

import s from './AboutPage.module.scss';

export const AboutPage = () => {
  const t = useTranslations('about');

  return (
    <main className={s.root}>
      <PageIntro aside={<GnomeBadge className={s.badge} size={148} />} intro={t('intro')} title={t('title')} />

      <dl className={s.facts}>
        {ABOUT_FACTS.map((fact) => (
          <div key={fact} className={s.fact}>
            <dt className={s.factLabel}>{t(`facts.${fact}.label`)}</dt>
            <dd className={s.factValue}>{t(`facts.${fact}.value`)}</dd>
          </div>
        ))}
      </dl>

      <div className={s.story}>
        {ABOUT_STORY.map((section, index) => (
          <Reveal key={section} as='section' className={s.section}>
            <span aria-hidden className={s.index}>
              {index + 1}
            </span>
            <div className={s.sectionText}>
              <Text as='h2' className={s.heading}>
                {t(`sections.${section}.title`)}
              </Text>
              <Text as='p' className={s.body}>
                {t(`sections.${section}.body`)}
              </Text>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal as='section' className={s.closing}>
        <GnomeBadge className={s.closingBadge} size={56} />
        <div className={s.sectionText}>
          <Text as='h2' className={s.heading}>
            {t(`sections.${ABOUT_CLOSING}.title`)}
          </Text>
          <Text as='p' className={s.body}>
            {t(`sections.${ABOUT_CLOSING}.body`)}
          </Text>
        </div>
      </Reveal>
    </main>
  );
};
